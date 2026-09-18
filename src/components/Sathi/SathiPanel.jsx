import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RotateCcw, HelpCircle, X, Send, Globe } from 'lucide-react';
import SathiAvatar from './SathiAvatar';
import SathiAudioVisualizer from './SathiAudioVisualizer';
import { cognitiveStore } from '../../lib/store/cognitiveStore';

export default function SathiPanel({
  state,
  transcript,
  sathiReply,
  isListening,
  isOnline = true,
  speechSupported = true,
  onStartListening,
  onStopListening,
  onSendMessage,
  onRepeat,
  onClose,
  currentLanguage,
  onChangeLanguage,
}) {
  const [inputText, setInputText] = useState('');
  const [storeData, setStoreData] = useState(cognitiveStore.getState());
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    const unsub = cognitiveStore.subscribe((newState) => {
      setStoreData({ ...newState });
    });
    return unsub;
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, sathiReply]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const quickPrompts = [
    { label: 'What should I do today?', prompt: 'What should I do today?' },
    { label: 'Start my memory game', prompt: 'Start my memory game' },
    { label: 'Remind me to drink water at 11', prompt: 'Remind me to drink water at 11' },
    { label: 'Show my progress', prompt: 'Show my progress' },
    { label: 'Hindi mein baat karein', prompt: 'Hindi mein baat karein' },
  ];

  return (
    <div className="relative w-full max-w-lg bg-warm-white text-charcoal rounded-[28px] shadow-warm-lg border border-terracotta/20 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
      <div className="bg-cream px-5 py-3.5 border-b border-charcoal/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sage animate-pulse" />
          <span className="text-xs font-semibold text-charcoal/80 uppercase tracking-wider">
            Sathi · AI Companion
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs bg-warm-white px-2 py-1 rounded-pill border border-charcoal/15">
            <Globe size={13} className="text-terracotta" />
            <select
              value={currentLanguage}
              onChange={(e) => onChangeLanguage(e.target.value)}
              className="bg-transparent text-charcoal font-medium focus:outline-none cursor-pointer text-xs"
              aria-label="Select Language"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="mni">Manipuri</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-pill bg-charcoal/5 hover:bg-terracotta/15 border border-charcoal/15 hover:border-terracotta/40 text-charcoal hover:text-terracotta transition min-h-[40px]"
            aria-label="Close Sathi"
            title="Close"
          >
            <X size={16} />
            <span className="text-xs font-semibold">Close</span>
          </button>
        </div>
      </div>

      {!isOnline && (
        <div className="px-4 py-2 bg-gold-light text-gold-dark text-[11px] text-center border-b border-gold/30">
          AI voice is temporarily unavailable offline. Games, reminders, and typing still work.
        </div>
      )}

      <div className="px-6 pt-6 pb-3 bg-gradient-to-b from-cream/60 via-warm-white to-warm-white flex flex-col items-center text-center">
        <div className="relative mb-3 mt-1">
          <SathiAvatar state={state} size="lg" showLabel variant="bust" />
        </div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-0.5">Sathi</h3>
        <p className="text-xs text-charcoal/65 max-w-xs font-light">
          Your gentle cognitive wellness companion — always listening with patience.
        </p>
        <p className="mt-1 text-[10px] text-charcoal/45">
          {storeData.user.name} · {storeData.user.cognitivePoints} pts · Level{' '}
          {storeData.user.currentLevel}
        </p>
      </div>

      <div className="flex-1 px-5 py-3 overflow-y-auto space-y-3 min-h-[160px] max-h-[220px]">
        {transcript && (
          <div className="flex justify-end">
            <div className="max-w-[85%] bg-cream border border-charcoal/10 px-4 py-2.5 rounded-2xl rounded-br-none text-xs sm:text-sm text-charcoal">
              <span className="text-[10px] text-charcoal/50 block font-semibold mb-0.5">You</span>
              {transcript}
            </div>
          </div>
        )}

        <div className="flex justify-start">
          <div className="max-w-[90%] bg-cream-card border border-terracotta/20 px-4 py-3 rounded-2xl rounded-bl-none text-xs sm:text-sm text-charcoal leading-relaxed shadow-warm-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-terracotta font-semibold uppercase tracking-wider">
                Sathi
              </span>
              <button
                type="button"
                onClick={onRepeat}
                title="Repeat message"
                className="text-[11px] text-terracotta hover:underline flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>Repeat</span>
              </button>
            </div>
            <p className="font-serif text-sm sm:text-base text-charcoal/90">&ldquo;{sathiReply}&rdquo;</p>
          </div>
        </div>
        <div ref={transcriptEndRef} />
      </div>

      {(state === 'listening' || state === 'thinking' || state === 'speaking') && (
        <div className="px-5 py-1 flex items-center justify-center bg-cream/40 border-t border-b border-charcoal/5">
          <SathiAudioVisualizer state={state} />
        </div>
      )}

      <div className="px-5 py-2.5 bg-warm-white border-t border-charcoal/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((p) => (
          <button
            key={p.prompt}
            type="button"
            onClick={() => onSendMessage(p.prompt)}
            className="flex-shrink-0 px-3 py-1.5 rounded-pill bg-cream hover:bg-cream-dark text-[11px] font-medium text-charcoal/80 border border-charcoal/15 transition cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="p-4 bg-cream/80 border-t border-charcoal/10 flex flex-col gap-3">
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onRepeat}
            className="p-3 rounded-full bg-warm-white border border-charcoal/15 text-charcoal/70 hover:text-charcoal hover:border-charcoal/30 shadow-warm-sm transition min-w-[48px] min-h-[48px] flex items-center justify-center"
            title="Repeat last statement"
            aria-label="Repeat last statement"
          >
            <RotateCcw size={20} />
          </button>

          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            disabled={!speechSupported && !isListening}
            className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-warm-white transition-all duration-300 shadow-warm-md hover:scale-105 cursor-pointer ${
              isListening
                ? 'bg-sage ring-4 ring-sage/40 animate-pulse'
                : 'bg-terracotta hover:bg-terracotta-hover shadow-glow-terracotta'
            } disabled:opacity-50`}
            aria-label={isListening ? 'Stop listening' : 'Start speaking to Sathi'}
          >
            {isListening ? <MicOff size={28} /> : <Mic size={28} />}
          </button>

          <button
            type="button"
            onClick={() => onSendMessage('Help me')}
            className="p-3 rounded-full bg-warm-white border border-charcoal/15 text-charcoal/70 hover:text-charcoal hover:border-charcoal/30 shadow-warm-sm transition min-w-[48px] min-h-[48px] flex items-center justify-center"
            title="Help instructions"
            aria-label="Help instructions"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        <p className="text-center text-xs font-medium text-charcoal/70">
          {isListening ? (
            <span className="text-sage-dark font-semibold animate-pulse">
              Listening to your voice… Tap to finish
            </span>
          ) : speechSupported ? (
            <span>Tap the microphone and speak naturally</span>
          ) : (
            <span>Voice not available here — type below instead</span>
          )}
        </p>

        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or type a question for Sathi..."
            className="flex-1 bg-warm-white border border-charcoal/20 rounded-pill px-4 py-2.5 text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-terracotta shadow-warm-sm"
          />
          <button
            type="submit"
            className="p-2.5 rounded-full bg-terracotta text-warm-white hover:bg-terracotta-hover transition disabled:opacity-40 min-w-[44px] min-h-[44px] flex items-center justify-center"
            disabled={!inputText.trim()}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      <div className="bg-warm-white px-5 py-2 text-[10px] text-charcoal/50 text-center border-t border-charcoal/5">
        Smriti Sathi supports cognitive engagement — it does not diagnose or treat any medical
        condition.
      </div>
    </div>
  );
}
