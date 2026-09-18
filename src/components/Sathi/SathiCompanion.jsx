import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Mic, Sparkles } from 'lucide-react';
import SathiAvatar from './SathiAvatar';
import SathiPanel from './SathiPanel';
import { speechService } from '../../lib/voice/speechRecognition';
import { ttsService } from '../../lib/voice/textToSpeech';
import { sathiBrain } from '../../lib/ai/sathi';
import { toolDispatcher } from '../../lib/ai/tools';
import { cognitiveStore } from '../../lib/store/cognitiveStore';

const GREETINGS = {
  en: 'Hello! I am Sathi, your memory companion. How can I help you today?',
  hi: 'नमस्ते! मैं साथी हूँ, आपकी स्मृति साथी। आज मैं आपकी कैसे मदद कर सकती हूँ?',
};

export default function SathiCompanion({ onOpenGame, isGameOpen, onPauseGame, onResumeGame }) {
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarState, setAvatarState] = useState('idle');
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [sathiReply, setSathiReply] = useState(GREETINGS.en);
  const [currentLanguage, setCurrentLanguage] = useState(
    () => cognitiveStore.getState().user.preferredLanguage || 'en'
  );
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [speechSupported] = useState(() => speechService.isSupported());

  useEffect(() => {
    toolDispatcher.setHandlers({
      openMemoryGame: () => {
        if (onOpenGame) onOpenGame();
      },
      scrollToCaregiver: () => {
        document.getElementById('for-caregivers')?.scrollIntoView({ behavior: 'smooth' });
      },
      scrollToSeniors: () => {
        document.getElementById('for-seniors')?.scrollIntoView({ behavior: 'smooth' });
      },
      scrollToTop: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      changeLanguage: (lang) => {
        setCurrentLanguage(lang);
      },
      pauseGame: () => {
        if (onPauseGame) onPauseGame();
      },
      resumeGame: () => {
        if (onResumeGame) onResumeGame();
      },
    });
  }, [onOpenGame, onPauseGame, onResumeGame]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const speakResponse = useCallback(
    (text) => {
      if (!ttsService.isSupported()) {
        setAvatarState('idle');
        return;
      }
      setAvatarState('speaking');
      ttsService.speak(text, {
        lang: currentLanguage,
        onStart: () => setAvatarState('speaking'),
        onEnd: () => setAvatarState('idle'),
        onError: () => setAvatarState('idle'),
      });
    },
    [currentLanguage]
  );

  useEffect(() => {
    const handleGameCompleted = (event) => {
      const { accuracy, mistakes, seconds, level } = event.detail || {};
      setAvatarState('success');

      const challenging = typeof accuracy === 'number' && accuracy < 55;
      let message;
      if (currentLanguage === 'hi') {
        message = challenging
          ? `आपने आज की गतिविधि पूरी की। यह थोड़ी चुनौतीपूर्ण रही। मैंने अगली गतिविधि को और आरामदायक बनाने के लिए समायोजित कर दिया है। आपकी प्रगति सहेजी गई है।`
          : `बहुत अच्छा! आपने ${seconds} सेकंड में ${accuracy}% सटीकता के साथ स्मृति गतिविधि पूरी की। मैंने आपकी प्रगति सहेज ली है और देखभालकर्ता डैशबोर्ड अपडेट कर दिया है।`;
      } else {
        message = challenging
          ? `That activity was a little challenging today. I've adjusted the next activity to make it more comfortable. I've saved your progress and updated your caregiver.`
          : `Well done. You completed today's memory activity in ${seconds} seconds with ${accuracy}% accuracy at level ${level}. I've saved your progress. Your next activity has been adjusted based on today's performance.`;
      }

      setSathiReply(message);
      setIsOpen(true);
      speakResponse(message);
    };

    window.addEventListener('sathi-game-completed', handleGameCompleted);
    return () => window.removeEventListener('sathi-game-completed', handleGameCompleted);
  }, [currentLanguage, speakResponse]);

  const handleSendMessage = async (text) => {
    if (!text?.trim()) return;
    speechService.stop();
    setIsListening(false);
    setUserTranscript(text);
    setAvatarState('thinking');

    try {
      const result = await sathiBrain.processInput(text, {
        currentLanguage,
        isGameOpen,
        isOnline,
      });

      setSathiReply(result.response);
      if (result.state === 'support') {
        setAvatarState('support');
        // Still speak support messages
        speakResponse(result.response);
      } else {
        speakResponse(result.response);
      }
    } catch (e) {
      console.warn('Sathi processing error:', e);
      const fallback =
        currentLanguage === 'hi'
          ? 'मैं आपके साथ हूँ। आज मैं आपकी कैसे मदद कर सकती हूँ?'
          : 'I am right here with you. How can I help you today?';
      setSathiReply(fallback);
      setAvatarState('support');
      speakResponse(fallback);
    }
  };

  const handleStartListening = () => {
    if (!speechSupported) {
      setSathiReply(
        currentLanguage === 'hi'
          ? 'आवाज़ पहचान इस ब्राउज़र में उपलब्ध नहीं है। कृपया नीचे टाइप करें।'
          : 'Voice recognition is not available in this browser. Please type below — everything still works.'
      );
      setAvatarState('support');
      setIsOpen(true);
      return;
    }

    ttsService.stopSpeaking();
    setAvatarState('listening');
    setIsListening(true);
    setUserTranscript('');

    const langTag = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';

    speechService.start({
      lang: langTag,
      onResult: ({ text, isFinal }) => {
        setUserTranscript(text);
        if (isFinal) {
          handleSendMessage(text);
        }
      },
      onError: (err) => {
        console.warn('Speech error:', err);
        setIsListening(false);
        setAvatarState('idle');
        if (err === 'not-allowed') {
          setSathiReply(
            'Microphone access was blocked. You can still type to me — I am listening either way.'
          );
          setIsOpen(true);
        }
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleStopListening = () => {
    speechService.stop();
    setIsListening(false);
    if (userTranscript) {
      handleSendMessage(userTranscript);
    } else {
      setAvatarState('idle');
    }
  };

  const handleRepeat = () => {
    speakResponse(sathiReply);
  };

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    cognitiveStore.setLanguage(lang);
    const greeting =
      lang === 'hi'
        ? GREETINGS.hi
        : lang === 'en'
          ? 'Certainly! I will now speak with you in English. How can I assist you today?'
          : 'I have noted your language preference. Full voice support for this language is coming soon — I will speak clearly in English for now.';
    setSathiReply(greeting);
    speakResponse(greeting);
  };

  const closePanel = useCallback(() => {
    ttsService.stopSpeaking();
    speechService.stop();
    setIsOpen(false);
    setIsListening(false);
    setAvatarState('idle');
  }, []);

  // Escape key closes the panel
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closePanel]);

  // Keep floating widget visible but quieter while game modal is open
  const collapsedHidden = isOpen;

  return (
    <>
      <AnimatePresence>
        {!collapsedHidden && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 ${
              isGameOpen ? 'opacity-90' : ''
            }`}
          >
            {!isOnline && (
              <div className="hidden sm:block max-w-[200px] bg-warm-white/95 border border-gold/40 text-[11px] text-charcoal/80 px-3 py-2 rounded-card shadow-warm-sm">
                AI voice is temporarily unavailable offline. Games and reminders still work.
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-warm-white/95 backdrop-blur-md px-4 py-2.5 rounded-card border border-terracotta/25 shadow-warm-md cursor-pointer hover:border-terracotta/50 transition text-left"
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-terracotta flex items-center gap-1">
                  <Sparkles size={12} />
                  Talk to Sathi
                </span>
                <span className="text-xs text-charcoal/80 font-serif">
                  &ldquo;What should I do today?&rdquo;
                </span>
              </div>
            </button>

            <div className="relative">
              <SathiAvatar
                state={avatarState}
                size="md"
                showLabel
                onClick={() => setIsOpen(true)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                  handleStartListening();
                }}
                className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-terracotta hover:bg-terracotta-hover text-warm-white flex items-center justify-center shadow-warm-md hover:scale-110 transition cursor-pointer border-2 border-warm-white"
                title="Speak directly to Sathi"
                aria-label="Speak to Sathi"
              >
                <Mic size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:justify-end p-3 sm:p-6 bg-charcoal/40 backdrop-blur-sm"
            onClick={closePanel}
            role="presentation"
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <SathiPanel
                state={avatarState}
                transcript={userTranscript}
                sathiReply={sathiReply}
                isListening={isListening}
                isOnline={isOnline}
                speechSupported={speechSupported}
                onStartListening={handleStartListening}
                onStopListening={handleStopListening}
                onSendMessage={handleSendMessage}
                onRepeat={handleRepeat}
                onClose={closePanel}
                currentLanguage={currentLanguage}
                onChangeLanguage={handleLanguageChange}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
