/**
 * Secure Gemini proxy for Sathi.
 * API key stays server-side only (never VITE_* / never browser).
 * Validates tool names against the same allowlist as the client.
 */

const APPROVED_TOOLS = new Set([
  'startMemoryGame',
  'startAttentionGame',
  'startRoutineRecall',
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
]);

const SYSTEM_PROMPT = `You are Sathi, a warm AI cognitive companion for elderly users in the Smriti Sathi app.
Speak in plain, calm language. Never diagnose medical conditions. Prefer "cognitive activity", "progress", "engagement", "adaptive difficulty".
You may ONLY request tools from this allowlist: ${[...APPROVED_TOOLS].join(', ')}.
Return STRICT JSON only, no markdown:
{"response":"string spoken to the user","tool":null|"name","args":{},"pendingAction":null|"startMemoryGame"}
If the user asks what to do today, suggest the memory activity and set pendingAction to "startMemoryGame" without calling a tool yet.
If they affirm after that, call startMemoryGame.
For reminders like "remind me to drink water at 11", call createReminder with {title,time,type}.
Keep responses short (1-3 sentences). Match the user's language (English or Hindi).`;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Body too large'));
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

export function createSathiApiMiddleware() {
  return async function sathiApiMiddleware(req, res, next) {
    const url = req.url?.split('?')[0];
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return sendJson(res, 503, {
        error: 'Gemini not configured',
        message: 'Set GEMINI_API_KEY on the server. Offline NLU remains available.',
      });
    }

    try {
      const body = await readJsonBody(req);
      const result = await callGemini({
        message: body.message || '',
        context: body.context || {},
        storeState: body.storeState || {},
        apiKey,
      });
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
