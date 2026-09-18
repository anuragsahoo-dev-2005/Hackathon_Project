// Web Speech Recognition Service
export class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  isSupported() {
    return Boolean(this.recognition);
  }

  start({ onResult, onError, onEnd, lang = 'en-IN', continuous = false }) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    this.recognition.lang = lang;
    this.recognition.continuous = continuous;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (onResult) {
        onResult({
          text: (finalTranscript || interimTranscript).trim(),
          isFinal: Boolean(finalTranscript)
        });
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start failed:', e);
      if (onError) onError(e);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Recognition stop error:', e);
      }
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechRecognitionService();
