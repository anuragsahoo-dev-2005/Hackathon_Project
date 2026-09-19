// Sathi AI Companion Brain & Intent Engine
// Dual mode: optional server-side Gemini (/api/sathi) + offline NLU fallback
// Never exposes API keys client-side.

import { toolDispatcher } from './tools';
import { cognitiveStore } from '../store/cognitiveStore';

const HI = {
  schedule:
    'सुप्रभात! आज आपके लिए एक हल्की स्मृति गतिविधि निर्धारित है। क्या आप शुरू करना चाहेंगे?',
  startYes: 'बहुत अच्छा! आइए आपकी स्मृति गतिविधि शुरू करते हैं।',
  startGame: 'ज़रूर! आज की स्मृति मिलान गतिविधि शुरू करते हैं।',
  reminder: (title, time) =>
    `ठीक है! मैंने "${title}" के लिए ${time} पर याद दिलाने का नोट बना दिया है। आपकी देखभाल करने वाली टीम को भी सूचित कर दिया गया है।`,
  progress: (points, streak, level) =>
    `आप बहुत अच्छा कर रहे हैं! आपके पास ${points} संज्ञानात्मक अंक हैं और ${streak} दिन की सक्रिय श्रृंखला है। आप अभी स्तर ${level} पर हैं।`,
  caregiver:
    'यह आपके देखभालकर्ता कनेक्शन वाला भाग है। जब भी आप कोई गतिविधि पूरी करते हैं, परिवार को धीरे-धीरे अपडेट मिलते हैं।',
  switchHi:
    'ज़रूर! अब मैं आपसे हिंदी में बात करूँगी। आज मैं आपकी कैसे मदद कर सकती हूँ?',
  help:
    "मैं आपके साथ हूँ! आप कह सकते हैं: 'मेरी मेमोरी गेम शुरू करो', 'Sequence Recall खोलो', 'आज क्या करना है?', 'ग्यारह बजे पानी पीने की याद दिलाओ', 'मेरी प्रगति दिखाओ', या 'इसे बंद करो'।",
  home: 'हम होम पेज के ऊपर वापस आ गए हैं।',
  default:
    'मैं सुन रही हूँ। आप मुझसे आज की स्मृति गतिविधि शुरू करने, याद दिलाने, या अपना कार्यक्रम देखने के लिए कह सकते हैं।',
  offlineAi: 'AI आवाज़ अभी ऑफ़लाइन है। आप टाइप करके भी मुझसे बात कर सकते हैं।',
};

export class SathiBrain {
  constructor() {
    this.lastResponse =
      'Hello! I am Sathi, your memory companion. How can I help you today?';
    this.conversationHistory = [];
    this.pendingAction = null; // e.g. 'startMemoryGame' after schedule suggestion
  }

  getLastResponse() {
    return this.lastResponse;
  }

  clearPendingAction() {
    this.pendingAction = null;
  }

  isOnline() {
    return typeof navigator === 'undefined' ? true : navigator.onLine;
  }

  isDeterministicActionRequest(text) {
    return [
      'close',
      'exit',
      'dismiss',
      'go back',
      'open ',
      'start ',
      'show ',
      'launch ',
      'begin ',
      'remind ',
      'set a reminder',
      'create a reminder',
      'pause',
      'resume',
      'repeat',
      'hindi',
      'english',
      'assamese',
      'bengali',
      'manipuri',
      'caregiver',
      'family',
      'progress',
      'score',
      'qr',
      'scan',
      'sequence',
      'recognition',
      'which one changed',
      'बंद',
      'खोल',
      'दिखा',
      'याद',
    ].some((phrase) => text.includes(phrase));
  }

  async processInput(userInput, context = {}) {
    const trimmed = userInput.trim().toLowerCase();
    this.conversationHistory.push({ role: 'user', text: userInput });

    // Execute app commands locally first so mobile and offline sessions never
    // depend on a cloud provider returning a correctly shaped tool call.
    if (this.isDeterministicActionRequest(trimmed)) {
      const localResult = await this.resolveLocalIntent(trimmed, userInput, context);
      this.lastResponse = localResult.response;
      this.conversationHistory.push({ role: 'sathi', text: localResult.response });
      return localResult;
    }

    const remoteAiEnabled =
      typeof window !== 'undefined' &&
      (window.__ENABLE_GEMINI_ENDPOINT__ === true ||
        import.meta.env?.VITE_ENABLE_GEMINI === 'true' ||
        import.meta.env?.VITE_ENABLE_GROQ === 'true');

    if (remoteAiEnabled && this.isOnline()) {
      try {
        const res = await fetch('/api/sathi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userInput,
            context: {
              ...context,
              pendingAction: this.pendingAction,
            },
            storeState: cognitiveStore.getState(),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.response) {
            const remoteTool = typeof data.tool === 'string'
              ? { name: data.tool, args: {} }
              : data.tool;
            if (remoteTool?.name) {
              await toolDispatcher.execute(remoteTool.name, remoteTool.args || {});
              if (remoteTool.name === 'startMemoryGame') this.pendingAction = null;
            }
            if (data.pendingAction !== undefined) {
              this.pendingAction = data.pendingAction;
            }
            if (!remoteTool?.name && this.isDeterministicActionRequest(trimmed)) {
              const localResult = await this.resolveLocalIntent(trimmed, userInput, context);
              this.lastResponse = localResult.response;
              this.conversationHistory.push({ role: 'sathi', text: localResult.response });
              return localResult;
            }
            this.lastResponse = data.response;
            this.conversationHistory.push({ role: 'sathi', text: data.response });
            return {
              response: data.response,
              toolCalled: remoteTool?.name || null,
              state: 'speaking',
            };
          }
        }
      } catch (e) {
        console.warn('Gemini endpoint unreachable, using offline NLU:', e);
      }
    }

    const result = await this.resolveLocalIntent(trimmed, userInput, context);
    this.lastResponse = result.response;
    this.conversationHistory.push({ role: 'sathi', text: result.response });
    return result;
  }

  detectHindi(text) {
    return (
      /[\u0900-\u097F]/.test(text) ||
      /\b(karo|karein|namaste|kya|khel|batao|pani|haan|madad|dobara|yaad)\b/.test(
        text
      )
    );
  }

  async resolveLocalIntent(text, originalText, context) {
    const lang = context.currentLanguage || cognitiveStore.getState().user.preferredLanguage || 'en';
    const isHindi = lang === 'hi' || this.detectHindi(text);
    const say = (en, hi) => (isHindi ? hi : en);

    // Closing commands take priority over opening commands such as "close the game".
    if (
      text === 'close' ||
      text === 'close it' ||
      text === 'close this' ||
      text === 'exit' ||
      text === 'dismiss' ||
      text.includes('close the') ||
      text.includes('close game') ||
      text.includes('close window') ||
      text.includes('go back') ||
      text.includes(' वापस') ||
      text.includes('बंद')
    ) {
      await toolDispatcher.execute('closeAllViews');
      return {
        response: say('Done. I closed the open view.', 'ठीक है। मैंने खुला हुआ पेज बंद कर दिया है।'),
        toolCalled: 'closeAllViews',
        state: 'speaking',
      };
    }

    // 1. Signature wow moment — schedule for today
    if (
      text.includes('what should i do') ||
      text.includes('what to do today') ||
      text.includes('schedule today') ||
      text.includes('what do i have') ||
      text.includes('aaj kya') ||
      text.includes('आज क्या')
    ) {
      this.pendingAction = 'startMemoryGame';
      return {
        response: say(
          'Good morning! You have a gentle memory activity scheduled for today. Would you like to start?',
          HI.schedule
        ),
        toolCalled: null,
        suggestedAction: 'startMemoryGame',
        state: 'speaking',
      };
    }

    // 2. Affirmative follow-up (only when we suggested an action)
    const isAffirm =
      text === 'yes' ||
      text === 'y' ||
      text === 'sure' ||
      text === 'haan' ||
      text === 'ha' ||
      text === 'okay' ||
      text === 'ok' ||
      text.includes("let's begin") ||
      text.includes('lets begin') ||
      text.includes('khel shuru') ||
      text.includes('शुरू');

    if (isAffirm && this.pendingAction === 'startMemoryGame') {
      await toolDispatcher.execute('startMemoryGame');
      this.pendingAction = null;
      return {
        response: say('Wonderful. Let’s begin your memory activity.', HI.startYes),
        toolCalled: 'startMemoryGame',
        state: 'speaking',
      };
    }

    // 3. Start memory / attention / routine (aliases open Memory Garden)
    if (
      text.includes('memory games') ||
      text.includes('all games') ||
      text.includes('game chooser') ||
      text.includes('choose a game')
    ) {
      await toolDispatcher.execute('openGameChooser');
      return {
        response: say('Opening the memory games so you can choose an activity.', 'मैं स्मृति गतिविधियों का चयन खोल रही हूँ।'),
        toolCalled: 'openGameChooser',
        state: 'speaking',
      };
    }

    if (
      text.includes('memory game') ||
      text.includes('memory activity') ||
      text.includes('start game') ||
      text.includes('open game') ||
      text.includes('memory garden') ||
      text.includes('game khelo') ||
      (text.includes('khel') && !text.includes('schedule')) ||
      text.includes('attention game') ||
      text.includes('routine recall')
    ) {
      let tool = 'startMemoryGame';
      if (text.includes('attention')) tool = 'startAttentionGame';
      if (text.includes('routine')) tool = 'startRoutineRecall';
      await toolDispatcher.execute(tool);
      this.pendingAction = null;
      return {
        response: say(
          'Of course! Let’s begin today’s memory matching activity.',
          HI.startGame
        ),
        toolCalled: tool,
        state: 'speaking',
      };
    }

    if (text.includes('sequence') || text.includes('sequence recall')) {
      await toolDispatcher.execute('openSequenceGame');
      return {
        response: say('Opening Sequence Recall for you.', 'मैं Sequence Recall गतिविधि खोल रही हूँ।'),
        toolCalled: 'openSequenceGame',
        state: 'speaking',
      };
    }

    if (text.includes('object recognition') || text.includes('recognize objects') || text.includes('recognition game')) {
      await toolDispatcher.execute('openRecognitionGame');
      return {
        response: say('Opening Object Recognition for you.', 'मैं Object Recognition गतिविधि खोल रही हूँ।'),
        toolCalled: 'openRecognitionGame',
        state: 'speaking',
      };
    }

    if (text.includes('which one changed') || text.includes('changed game')) {
      await toolDispatcher.execute('openWhichChangedGame');
      return {
        response: say('Opening Which One Changed for you.', 'मैं Which One Changed गतिविधि खोल रही हूँ।'),
        toolCalled: 'openWhichChangedGame',
        state: 'speaking',
      };
    }

    if (text.includes('game options') || text.includes('activity options')) {
      await toolDispatcher.execute('openGameChooser');
      return {
        response: say('Of course. I opened the activity garden so you can choose what feels right today.', 'ज़रूर। मैंने गतिविधियों का बगीचा खोल दिया है। आज जो अच्छा लगे, चुनिए।'),
        toolCalled: 'openGameChooser',
        state: 'speaking',
      };
    }

    // 4. Reminders
    if (
      text.includes('remind') ||
      text.includes('reminder') ||
      text.includes('yaad dilana') ||
      text.includes('याद') ||
      (text.includes('pani') && text.includes('baje')) ||
      text.includes('पानी')
    ) {
      let time = '11:00 AM';
      let title = 'Drink warm water';
      let type = 'hydration';

      const timeMatch = originalText.match(
        /(\d{1,2}(:\d{2})?\s*(am|pm|a\.m\.|p\.m\.|baje)?)/i
      );
      if (timeMatch) {
        time = timeMatch[0].trim();
        const lower = time.toLowerCase();
        if (!/(am|pm|a\.m\.|p\.m\.|baje)/i.test(lower)) {
          time += ' AM';
        }
      }

      if (
        text.includes('medicine') ||
        text.includes('pill') ||
        text.includes('tablet') ||
        text.includes('dawai') ||
        text.includes('दवा')
      ) {
        title = 'Take evening medicine with tea';
        type = 'medication';
      } else if (text.includes('walk') || text.includes('sair') || text.includes('सैर')) {
        title = 'Evening garden stroll';
        type = 'wellness';
      }

      await toolDispatcher.execute('createReminder', { title, time, type });
      return {
        response: say(
          `Sure! I’ve created a reminder for "${title}" at ${time}. It’s also saved for your caregiver.`,
          HI.reminder(title, time)
        ),
        toolCalled: 'createReminder',
        state: 'speaking',
      };
    }

    // 5. Progress
    if (
      text.includes('progress') ||
      text.includes('score') ||
      text.includes('points') ||
      text.includes('kaisa kiya') ||
      text.includes('प्रगति')
    ) {
      const res = await toolDispatcher.execute('getProgress');
      const { points, streak, level } = res.data;
      return {
        response: say(
          `You’re doing wonderfully! You have earned ${points} cognitive wellness points with a ${streak}-day active streak. You are currently on Level ${level}.`,
          HI.progress(points, streak, level)
        ),
        toolCalled: 'getProgress',
        state: 'speaking',
      };
    }

    // 6. Today’s schedule / list reminders
    if (
      text.includes('schedule') ||
      text.includes('reminders') ||
      text.includes('list reminder') ||
      text.includes('my reminders')
    ) {
      const res = await toolDispatcher.execute('getTodaySchedule');
      const count = res.data?.pendingCount ?? 0;
      const titles =
        res.data?.reminders?.map((r) => `${r.title} at ${r.time}`).join('; ') ||
        'no pending items';
      return {
        response: say(
          `You have ${count} pending items today: ${titles}.`,
          `आज आपके ${count} लंबित काम हैं: ${titles}.`
        ),
        toolCalled: 'getTodaySchedule',
        state: 'speaking',
      };
    }

    // 7. Caregiver
    if (
      text.includes('caregiver dashboard') ||
      text.includes('family dashboard') ||
      text.includes('caregiver') ||
      text.includes('family') ||
      text.includes('daughter') ||
      text.includes('beta') ||
      text.includes('beti') ||
      text.includes('परिवार')
    ) {
      await toolDispatcher.execute('openCaregiverDashboard');
      return {
        response: say(
          'Here is your Caregiver Connection section. Your family receives gentle updates whenever you complete an activity.',
          HI.caregiver
        ),
        toolCalled: 'openCaregiverDashboard',
        state: 'speaking',
      };
    }

    // 8. Language
    if (text.includes('hindi') || text.includes('हिंदी') || text.includes('हिन्दी')) {
      await toolDispatcher.execute('changeLanguage', { language: 'hi' });
      return {
        response: HI.switchHi,
        toolCalled: 'changeLanguage',
        state: 'speaking',
      };
    }
    if (text.includes('english') || text.includes('अंग्रेज़ी') || text.includes('अंग्रेजी')) {
      await toolDispatcher.execute('changeLanguage', { language: 'en' });
      return {
        response:
          'Certainly! I will now speak with you in English. How can I assist you today?',
        toolCalled: 'changeLanguage',
        state: 'speaking',
      };
    }
    // Scaffolded languages — acknowledge, keep responses English until fully wired
    if (text.includes('assamese') || text.includes('অসমীয়া')) {
      await toolDispatcher.execute('changeLanguage', { language: 'as' });
      return {
        response:
          'Assamese support is being prepared. I’ll keep speaking clearly in English for now, and remember your preference.',
        toolCalled: 'changeLanguage',
        state: 'speaking',
      };
    }
    if (text.includes('bengali') || text.includes('বাংলা')) {
      await toolDispatcher.execute('changeLanguage', { language: 'bn' });
      return {
        response:
          'Bengali support is being prepared. I’ll keep speaking clearly in English for now, and remember your preference.',
        toolCalled: 'changeLanguage',
        state: 'speaking',
      };
    }
    if (text.includes('manipuri') || text.includes('মৈতৈ')) {
      await toolDispatcher.execute('changeLanguage', { language: 'mni' });
      return {
        response:
          'Manipuri support is being prepared. I’ll keep speaking clearly in English for now, and remember your preference.',
        toolCalled: 'changeLanguage',
        state: 'speaking',
      };
    }

    // 9. Repeat
    if (
      text.includes('repeat') ||
      text.includes('dobara') ||
      text.includes('again') ||
      text.includes('phir se') ||
      text.includes('क्या कहा')
    ) {
      return {
        response: say(
          `I said: "${this.lastResponse}"`,
          `मैंने कहा था: "${this.lastResponse}"`
        ),
        toolCalled: 'repeatInstruction',
        state: 'speaking',
      };
    }

    // 10. Help / support tone
    if (
      text.includes('help') ||
      text.includes('madad') ||
      text.includes('stuck') ||
      text.includes('confused') ||
      text.includes('what can you do') ||
      text.includes('मदद')
    ) {
      return {
        response: say(
          "I'm right here with you. That's okay — take your time. You can ask me: 'Start my memory game', 'Open Sequence Recall', 'Close it', 'What should I do today?', 'Remind me to drink water at 11', or 'Show my progress'. Would you like a hint?",
          HI.help
        ),
        toolCalled: null,
        state: 'support',
      };
    }

    // 11. Pause / resume (game context)
    if (text.includes('pause') && context.isGameOpen) {
      await toolDispatcher.execute('pauseGame');
      return {
        response: say('Paused. Say “resume” whenever you’re ready.', 'रोक दिया। जब तैयार हों तो “resume” कहें।'),
        toolCalled: 'pauseGame',
        state: 'speaking',
      };
    }
    if (text.includes('resume') && context.isGameOpen) {
      await toolDispatcher.execute('resumeGame');
      return {
        response: say('Welcome back. Let’s continue gently.', 'वापस स्वागत है। आराम से जारी रखें।'),
        toolCalled: 'resumeGame',
        state: 'speaking',
      };
    }

    // 12. Profile / home
    if (text.includes('profile')) {
      await toolDispatcher.execute('openProfile');
      return {
        response: say(
          'Opening your profile area on the home page.',
          'होम पेज पर आपका प्रोफ़ाइल क्षेत्र खोल रही हूँ।'
        ),
        toolCalled: 'openProfile',
        state: 'speaking',
      };
    }
    if (text.includes('home') || text.includes('go top') || text.includes('shuru')) {
      await toolDispatcher.execute('goHome');
      return {
        response: say('We are back at the top of the home page.', HI.home),
        toolCalled: 'goHome',
        state: 'speaking',
      };
    }

    if (text.includes('qr') || text.includes('scan') || text.includes('phone')) {
      await toolDispatcher.execute('openScanPage');
      return {
        response: say('I opened the QR page so you can try Smriti Sathi on another phone.', 'मैंने QR पेज खोल दिया है ताकि आप Smriti Sathi को दूसरे फोन पर आज़मा सकें।'),
        toolCalled: 'openScanPage',
        state: 'speaking',
      };
    }

    if (text.includes('impact') || text.includes('results') || text.includes('validation')) {
      await toolDispatcher.execute('scrollToImpact');
      return {
        response: say('I opened our impact and validation section for you.', 'मैंने प्रभाव और परिणाम वाला भाग खोल दिया है।'),
        toolCalled: 'scrollToImpact',
        state: 'speaking',
      };
    }

    // Context-aware default
    if (context.isGameOpen) {
      return {
        response: say(
          'You’re doing great — take your time with each card. Say “help” if you’d like a hint.',
          'आप बहुत अच्छा कर रहे हैं — हर कार्ड पर अपना समय लें। संकेत चाहिए तो “मदद” कहें।'
        ),
        toolCalled: null,
        state: 'support',
      };
    }

    const conversationalReply = originalText.length > 2
      ? `I hear you. Thank you for telling me, "${originalText.slice(0, 120)}${originalText.length > 120 ? '…' : ''}". I’m here with you. Would you like to talk about it, take a gentle activity, or simply sit together for a moment?`
      : 'I am right here with you. You can talk to me about your day, your memories, or anything on your mind.';
    return {
      response: say(conversationalReply, `मैं आपकी बात सुन रही हूँ। आपने कहा, "${originalText.slice(0, 80)}"। मैं आपके साथ हूँ। क्या आप इसके बारे में और बताना चाहेंगे?`),
      toolCalled: null,
      state: 'support',
    };
  }
}

// Single integration boundary: the UI does not need to know whether intent
// resolution is local or backed by the future secure Gemini route.
export async function resolveIntent(userSpeech, context = {}) {
  return sathiBrain.processInput(userSpeech, context);
}

export const sathiBrain = new SathiBrain();
