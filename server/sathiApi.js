/**
 * Secure Gemini proxy for Sathi.
 * API key stays server-side only (never VITE_* / never browser).
 * Validates tool names against the same allowlist as the client.
 */

const APPROVED_TOOLS = new Set([
  'startMemoryGame',
  'startAttentionGame',
  'startRoutineRecall',
  'openSequenceGame',
  'openRecognitionGame',
  'openWhichChangedGame',
  'getTodaySchedule',
  'getProgress',
  'getRecentActivity',
  'createReminder',
  'listReminders',
  'changeLanguage',
  'repeatInstruction',
  'pauseGame',
  'resumeGame',
  'openCaregiverDashboard',
  'openProfile',
  'goHome',
  'openGameChooser',
  'openScanPage',
  'scrollToImpact',
  'closeCurrentView',
  'closeAllViews',
]);

const SYSTEM_PROMPT = `You are Sathi, a warm AI cognitive companion for elderly users in the Smriti Sathi app.
Speak in plain, calm language. Never diagnose medical conditions. Prefer "cognitive activity", "progress", "engagement", "adaptive difficulty".
You may ONLY request tools from this allowlist: ${[...APPROVED_TOOLS].join(', ')}.
Return STRICT JSON only, no markdown:
{"response":"string spoken to the user","tool":null|"name","args":{},"pendingAction":null|"startMemoryGame"}
If the user asks what to do today, suggest the memory activity and set pendingAction to "startMemoryGame" without calling a tool yet.
If they affirm after that, call startMemoryGame.
For reminders like "remind me to drink water at 11", call createReminder with {title,time,type}.
Use openGameChooser for the activity chooser, openSequenceGame for Sequence Recall, openRecognitionGame for Object Recognition, openWhichChangedGame for Which One Changed, openCaregiverDashboard for family care, openProfile for the seniors area, scrollToImpact for impact/results, openScanPage for the QR page, and goHome for the top of the site. Use closeAllViews when the user asks to close, exit, dismiss, or go back from an open view.
For casual conversation, respond naturally and warmly even when no tool is needed. Ask a gentle follow-up when it helps.
Keep responses short (1-3 sentences). Match the requested language in user.language exactly. The language code may be en, hi, as, bn, mni, kh, lus, or brx; write the response naturally in that language, using simple words suitable for an older adult. Do not transliterate unless the user asks.`;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 15_000_000) {
        reject(new Error('Audio body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(body);
}

async function transcribeWithGroq({ audio, mimeType, apiKey }) {
  const audioBuffer = Buffer.from(audio, 'base64');
  const form = new FormData();
  form.append('file', new Blob([audioBuffer], { type: mimeType || 'audio/webm' }), 'sathi-recording.webm');
  form.append('model', process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo');
  form.append('response_format', 'json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq STT ${response.status}: ${errorText.slice(0, 200)}`);
  }
  const result = await response.json();
  return { text: String(result.text || '') };
}

async function speakWithGroq({ text, apiKey }) {
  const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_TTS_MODEL || 'canopylabs/orpheus-v1-english',
      input: text,
      voice: process.env.GROQ_TTS_VOICE || 'autumn',
      response_format: 'wav',
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq TTS ${response.status}: ${errorText.slice(0, 200)}`);
  }
  const audio = Buffer.from(await response.arrayBuffer()).toString('base64');
  return { audio, mimeType: 'audio/wav' };
}

async function analyzeImageWithGroq({ image, prompt, apiKey }) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_VISION_MODEL || 'qwen-3.6-27b',
      temperature: 0.2,
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt || 'Describe this family memory image warmly and briefly.' },
          { type: 'image_url', image_url: { url: image } },
        ],
      }],
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq vision ${response.status}: ${errorText.slice(0, 200)}`);
  }
  const result = await response.json();
  return { text: String(result.choices?.[0]?.message?.content || '') };
}

function sanitizeTool(tool) {
  if (!tool || typeof tool !== 'object') return null;
  const name = tool.name || tool;
  if (typeof name !== 'string' || !APPROVED_TOOLS.has(name)) return null;
  return {
    name,
    args: tool.args && typeof tool.args === 'object' ? tool.args : {},
  };
}

async function callGemini({ message, context, storeState, apiKey }) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const userPayload = {
    message,
    context,
    user: storeState?.user
      ? {
          name: storeState.user.name,
          language: storeState.user.preferredLanguage,
          points: storeState.user.cognitivePoints,
          streak: storeState.user.streakDays,
          level: storeState.user.currentLevel,
        }
      : null,
    pendingReminders: (storeState?.reminders || [])
      .filter((r) => r.status === 'pending')
      .slice(0, 5)
      .map((r) => ({ title: r.title, time: r.time })),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser request JSON:\n${JSON.stringify(userPayload)}` }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : null;
  }
  if (!parsed?.response) {
    throw new Error('Invalid Gemini JSON response');
  }

  return {
    response: String(parsed.response),
    tool: sanitizeTool(parsed.tool),
    pendingAction: parsed.pendingAction ?? null,
  };
}

async function callGroq({ message, context, storeState, apiKey }) {
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: 512,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            message,
            context,
            user: storeState?.user || null,
            pendingReminders: (storeState?.reminders || [])
              .filter((reminder) => reminder.status === 'pending')
              .slice(0, 5)
              .map((reminder) => ({ title: reminder.title, time: reminder.time })),
          }),
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq ${res.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : null;
  }
  if (!parsed?.response) throw new Error('Invalid Groq JSON response');

  return {
    response: String(parsed.response),
    tool: sanitizeTool(parsed.tool),
    pendingAction: parsed.pendingAction ?? null,
  };
}

export function createSathiApiMiddleware() {
  return async function sathiApiMiddleware(req, res, next) {
    const url = req.url?.split('?')[0];
    if (url === '/api/sathi/transcribe') {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!process.env.GROQ_API_KEY) return sendJson(res, 503, { error: 'Speech-to-text is not configured' });
      try {
        const body = await readJsonBody(req);
        if (!body.audio) return sendJson(res, 400, { error: 'Audio is required' });
        return sendJson(res, 200, await transcribeWithGroq({
          audio: body.audio,
          mimeType: body.mimeType,
          apiKey: process.env.GROQ_API_KEY,
        }));
      } catch (error) {
        console.warn('[Groq STT]', error.message);
        return sendJson(res, 502, { error: 'Speech transcription failed' });
      }
    }
    if (url === '/api/sathi/speak') {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!process.env.GROQ_API_KEY) return sendJson(res, 503, { error: 'Text-to-speech is not configured' });
      try {
        const body = await readJsonBody(req);
        if (!body.text || typeof body.text !== 'string') return sendJson(res, 400, { error: 'Text is required' });
        return sendJson(res, 200, await speakWithGroq({
          text: body.text.slice(0, 2000),
          apiKey: process.env.GROQ_API_KEY,
        }));
      } catch (error) {
        console.warn('[Groq TTS]', error.message);
        return sendJson(res, 502, { error: 'Speech generation failed' });
      }
    }
    if (url === '/api/sathi/vision') {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
      if (!process.env.GROQ_API_KEY) return sendJson(res, 503, { error: 'Vision is not configured' });
      try {
        const body = await readJsonBody(req);
        if (!body.image || typeof body.image !== 'string') return sendJson(res, 400, { error: 'Image is required' });
        if (!body.image.startsWith('data:image/')) return sendJson(res, 400, { error: 'Image must be a data URL' });
        return sendJson(res, 200, await analyzeImageWithGroq({
          image: body.image,
          prompt: body.prompt,
          apiKey: process.env.GROQ_API_KEY,
        }));
      } catch (error) {
        console.warn('[Groq vision]', error.message);
        return sendJson(res, 502, { error: 'Image analysis failed' });
      }
    }
    if (url !== '/api/sathi') {
      return next();
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.end();
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const apiKey = groqKey || geminiKey;
    if (!apiKey) {
      return sendJson(res, 503, {
        error: 'AI provider not configured',
        message: 'Set GROQ_API_KEY on the server. Offline NLU remains available.',
      });
    }

    try {
      const body = await readJsonBody(req);
      const request = {
        message: body.message || '',
        context: body.context || {},
        storeState: body.storeState || {},
        apiKey,
      };
      const result = groqKey ? await callGroq(request) : await callGemini(request);
      return sendJson(res, 200, result);
    } catch (e) {
      console.warn('[Sathi API]', e.message);
      return sendJson(res, 502, { error: 'Gemini request failed', detail: e.message });
    }
  };
}

/** Vite plugin: mounts POST /api/sathi during `vite` / `vite preview` */
export function sathiApiPlugin() {
  const middleware = createSathiApiMiddleware();
  return {
    name: 'sathi-gemini-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
