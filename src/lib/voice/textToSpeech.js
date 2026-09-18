// Elder-calibrated TTS — always prefers a warm female / girl voice for Sathi
export class TextToSpeechService {
  constructor() {
    this.voices = [];
    this.isSpeaking = false;
    this.init();
  }

  init() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices() || [];
    };

    loadVoices();
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    // Chrome often loads voices asynchronously
    setTimeout(loadVoices, 250);
    setTimeout(loadVoices, 1000);
  }

  isSupported() {
    return typeof window !== 'undefined' && Boolean(window.speechSynthesis);
  }

  /** Prefer clearly female / girl voices; never pick an obviously male one when a better option exists. */
  pickFemaleVoice(targetLang) {
    const voices = this.voices.length
      ? this.voices
      : typeof window !== 'undefined'
        ? window.speechSynthesis.getVoices()
        : [];

    if (!voices.length) return null;

    const langRoot = targetLang.split('-')[0].toLowerCase();
    const inLang = voices.filter(
      (v) =>
        v.lang.toLowerCase() === targetLang.toLowerCase() ||
        v.lang.toLowerCase().startsWith(langRoot)
    );
    const pool = inLang.length ? inLang : voices;

    const femaleHints =
      /female|woman|girl|zira|samantha|susan|karen|victoria|moira|fiona|tessa|veena|heera|kalpana|neerja|asha|lekha|meera|google uk english female|google us english|microsoft zira|microsoft hazel|microsoft aria|microsoft jenny|microsoft sona|microsoft swara|natural.*female/i;
    const maleHints =
      /\bmale\b|david|mark|daniel|thomas|fred|ravi|google uk english male|microsoft david|microsoft mark|microsoft ravi|alex(?!a)/i;

    const scored = pool
      .map((v) => {
        const name = `${v.name} ${v.lang}`;
        let score = 0;
        if (femaleHints.test(name)) score += 50;
        if (maleHints.test(name)) score -= 80;
        if (v.lang.toLowerCase() === targetLang.toLowerCase()) score += 20;
        else if (v.lang.toLowerCase().startsWith(langRoot)) score += 10;
        // Prefer local / higher-quality voices when marked
        if (v.localService) score += 5;
        return { v, score };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (best && best.score > -40) return best.v;

    // Absolute fallback: any non-male voice in pool
    return pool.find((v) => !maleHints.test(`${v.name} ${v.lang}`)) || pool[0] || null;
  }

  speak(text, { lang = 'en', onStart, onEnd, onError } = {}) {
    if (!this.isSupported() || !text) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    // Voices may still be loading — refresh then speak
    this.voices = window.speechSynthesis.getVoices() || this.voices;

    const run = () => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Gentle, clear, slightly higher pitch for a warm feminine tone
      utterance.rate = 0.9;
      utterance.pitch = 1.18;
      utterance.volume = 1;

      const isHindi = String(lang).startsWith('hi') || /[\u0900-\u097F]/.test(text);
      const targetLang = isHindi ? 'hi-IN' : 'en-IN';
      utterance.lang = targetLang;

      const femaleVoice = this.pickFemaleVoice(targetLang);
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        // Keep lang aligned with chosen voice when possible
        if (femaleVoice.lang) utterance.lang = femaleVoice.lang;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        console.warn('TTS error:', e);
        if (onError) onError(e);
        if (onEnd) onEnd();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
        if (onEnd) onEnd();
      }
    };

    // If no voices yet, wait briefly for onvoiceschanged
    if (!this.voices.length) {
      const once = () => {
        this.voices = window.speechSynthesis.getVoices() || [];
        run();
      };
      window.speechSynthesis.addEventListener('voiceschanged', once, { once: true });
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', once);
        run();
      }, 400);
      return;
    }

    run();
  }

  stopSpeaking() {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('TTS cancel error:', e);
      }
      this.isSpeaking = false;
    }
  }
}

export const ttsService = new TextToSpeechService();
