import { cognitiveStore } from '../lib/store/cognitiveStore';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_ICONS } from './gameIconsData';
import { RotateCcw, Volume2, VolumeX, Sparkles, CheckCircle, Brain, X, ArrowRight, Award, Shield } from 'lucide-react';
import { chime } from './AudioChime';

// Difficulty definitions
const LEVELS = {
  1: { pairs: 6, label: "Level 1: Gentle", cols: "grid-cols-3 sm:grid-cols-4", desc: "6 matching pairs • Relaxed pace" },
  2: { pairs: 8, label: "Level 2: Standard", cols: "grid-cols-3 sm:grid-cols-4", desc: "8 matching pairs • 4x4 classic grid" },
  3: { pairs: 10, label: "Level 3: Extended", cols: "grid-cols-3 sm:grid-cols-5", desc: "10 matching pairs • Higher variety" }
};

export default function MemoryMatchGame({ onClose, isPaused = false }) {
  const [level, setLevel] = useState(2);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false); // OFF by default as required
  const [adaptiveFeedback, setAdaptiveFeedback] = useState(null);
  const timerRef = useRef(null);
  const wasRunningBeforePause = useRef(false);

  // Sync sound initial state
  useEffect(() => {
    chime.muted = !soundEnabled;
  }, [soundEnabled]);

  // Start new round
  const setupGame = (selectedLevel = level) => {
    const pairCount = LEVELS[selectedLevel].pairs;
    
    // Shuffle all 23 available icons and pick pairCount icons
    const shuffledPool = [...GAME_ICONS].sort(() => 0.5 - Math.random());
    const selectedIcons = shuffledPool.slice(0, pairCount);

    // Create duplicate pairs
    const deck = [];
    selectedIcons.forEach((icon) => {
      deck.push({ ...icon, uniqueId: `${icon.id}-a` });
      deck.push({ ...icon, uniqueId: `${icon.id}-b` });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMistakes(0);
    setMatchesCount(0);
    setIsWon(false);
    setSeconds(0);
    setIsTimerRunning(true);
    setAdaptiveFeedback(null);
  };

  useEffect(() => {
    setupGame(level);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isPaused]);

  // Voice pause / resume from Sathi
  useEffect(() => {
    if (isPaused) {
      wasRunningBeforePause.current = isTimerRunning;
      setIsTimerRunning(false);
    } else if (wasRunningBeforePause.current && !isWon) {
      setIsTimerRunning(true);
      wasRunningBeforePause.current = false;
    }
  }, [isPaused]);

  // Handle card click
  const handleCardClick = (index) => {
    if (isPaused || isWon) return;
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index].id)) return;

    if (soundEnabled) chime.playFlip();
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.id === secondCard.id) {
        // MATCH!
        setTimeout(() => {
          if (soundEnabled) chime.playMatch();
          const nextMatched = [...matched, firstCard.id];
          setMatched(nextMatched);
          setMatchesCount((prev) => prev + 1);
          setFlipped([]);

          // Check if game complete
          if (nextMatched.length === LEVELS[level].pairs) {
            handleRoundComplete(matchesCount + 1, mistakes);
          }
        }, 350);
      } else {
        // NO MATCH -> pause 1.0s so elderly user can register what they saw
        setMistakes((prev) => prev + 1);
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  // Adaptive Difficulty Calculation upon completion
  const handleRoundComplete = (finalMatches, finalMistakes) => {
    setIsTimerRunning(false);
    setIsWon(true);

    const totalAttempts = finalMatches + finalMistakes;
    const accuracy = totalAttempts > 0 ? finalMatches / totalAttempts : 1;
    const percentAccuracy = Math.round(accuracy * 100);

    cognitiveStore.recordActivity({
      title: `Memory Match (Level ${level})`,
      result: `Matched ${finalMatches} pairs in ${formatTime(seconds)}`,
      accuracy: percentAccuracy,
      mistakes: finalMistakes,
      duration: `${seconds}s`,
      level
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sathi-game-completed', {
        detail: {
          accuracy: percentAccuracy,
          mistakes: finalMistakes,
          seconds,
          level
        }
      }));
    }
    if (soundEnabled) chime.playWin();

    // Adaptive band selection
    let nextLvl = level;
    let feedback = {};

    if (accuracy >= 0.70 && finalMistakes <= 4) {
      // Strong performance
      nextLvl = Math.min(level + 1, 3);
      feedback = {
        title: "Great focus today! Next round: Level " + nextLvl,
        tone: "text-sage-dark bg-sage-light border-sage/40",
        message: "Your recognition speed and accuracy were wonderful. I've prepared a slightly richer card set for your next activity.",
        suggestedLevel: nextLvl
      };
    } else if (accuracy >= 0.45 || finalMistakes <= 8) {
      // Average performance
      nextLvl = level;
      feedback = {
        title: "Let's keep it steady — same level next time",
        tone: "text-gold-dark bg-gold-light border-gold/40",
        message: "Consistent and patient pacing is wonderful. We'll practice at this comfortable level once more.",
        suggestedLevel: nextLvl
      };
    } else {
      // Weaker performance -> ease back
      nextLvl = Math.max(level - 1, 1);
      feedback = {
        title: "No rush — we'll ease it back a little",
        tone: "text-terracotta bg-terracotta-light border-terracotta/40",
        message: "No pressure at all. I've simplified the next activity so you can play without fatigue.",
        suggestedLevel: nextLvl
      };
    }

    if (typeof cognitiveStore.setLevel === 'function') {
      cognitiveStore.setLevel(nextLvl);
    }

    setAdaptiveFeedback(feedback);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalPairs = LEVELS[level].pairs;

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-warm-white text-charcoal rounded-[24px] shadow-warm-lg border border-charcoal/10 overflow-hidden flex flex-col">
      {isPaused && (
        <div className="absolute inset-0 z-20 bg-cream/80 backdrop-blur-[2px] flex items-center justify-center p-6">
          <div className="bg-warm-white border border-terracotta/25 rounded-card shadow-warm-md px-6 py-5 text-center max-w-sm">
            <p className="font-serif text-lg text-charcoal mb-1">Paused</p>
            <p className="text-sm text-charcoal/70">
              Take your time. Ask Sathi to resume whenever you are ready.
            </p>
          </div>
        </div>
      )}
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal/10 bg-cream/90 px-4 py-4 backdrop-blur-md sm:gap-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-terracotta/15 flex items-center justify-center text-terracotta">
            <Brain size={20} />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal leading-tight">
              Memory Match Companion
            </h2>
            <p className="text-xs text-charcoal/70">
              Gentle visual recall with traditional Indian cultural & botanical keepsakes
            </p>
          </div>
        </div>

        {/* Controls: Sound, Level, Close */}
        <div className="flex items-center gap-3">
          {/* Audio toggle button */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-full border transition-all ${
              soundEnabled
                ? 'bg-gold-light border-gold text-gold-dark'
                : 'bg-warm-white border-charcoal/20 text-charcoal/50 hover:text-charcoal'
            }`}
            title={soundEnabled ? "Sound enabled (click to mute)" : "Sound off (click to enable gentle chime)"}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Reset button */}
          <button
            onClick={() => setupGame(level)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold bg-cream hover:bg-cream-dark border border-charcoal/15 text-charcoal transition"
            title="Shuffle and start fresh"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          {/* Close Modal button if supplied */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-charcoal/10 text-charcoal/70 hover:text-charcoal transition"
              aria-label="Close Game"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Progress & AI Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal/5 bg-warm-white px-4 py-3 text-xs sm:px-6 sm:text-sm">
        <div className="flex items-center gap-4 text-charcoal/80 font-medium">
          <span>
            Pairs Matched: <strong className="text-terracotta font-serif text-base">{matched.length}/{totalPairs}</strong>
          </span>
          <span className="text-charcoal/30">•</span>
          <span>
            Gentle Attempts: <strong className="text-charcoal">{matchesCount + mistakes}</strong>
          </span>
          <span className="text-charcoal/30">•</span>
          <span>
            Time: <strong className="text-charcoal">{formatTime(seconds)}</strong>
          </span>
        </div>

        {/* Level selector tabs */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((lvlNum) => (
            <button
              key={lvlNum}
              onClick={() => {
                setLevel(lvlNum);
                setupGame(lvlNum);
              }}
              className={`px-3 py-1 rounded-pill text-xs font-medium transition ${
                level === lvlNum
                  ? 'bg-terracotta text-warm-white shadow-warm-sm'
                  : 'bg-cream text-charcoal/70 hover:bg-cream-dark'
              }`}
            >
              Lvl {lvlNum} ({LEVELS[lvlNum].pairs * 2} cards)
            </button>
          ))}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="p-5 sm:p-7 flex-1 flex flex-col items-center justify-center bg-cream/30 min-h-[440px]">
        
        {/* Game completion overlay */}
        <AnimatePresence>
          {isWon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-lg mx-auto bg-warm-white rounded-card p-6 sm:p-8 border border-sage/40 shadow-warm-lg text-center my-4"
            >
              <div className="w-16 h-16 rounded-full bg-sage-light text-sage-dark flex items-center justify-center mx-auto mb-4 shadow-warm-sm">
                <Award size={32} />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-2">
                Well done! Memories connected.
              </h3>
              <p className="text-sm text-charcoal/75 mb-6 font-light">
                You successfully found all {totalPairs} matching keepsakes in {formatTime(seconds)}.
              </p>

              {/* AI Adaptive Feedback Card */}
              {adaptiveFeedback && (
                <div className={`p-4 rounded-soft border mb-6 text-left ${adaptiveFeedback.tone}`}>
                  <div className="font-semibold text-xs sm:text-sm mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={16} />
                    <span>{adaptiveFeedback.title}</span>
                  </div>
                  <p className="text-xs text-charcoal/80 leading-relaxed font-light">
                    {adaptiveFeedback.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const nextLvl = adaptiveFeedback?.suggestedLevel || level;
                    setLevel(nextLvl);
                    setupGame(nextLvl);
                  }}
                  className="px-6 py-3 rounded-pill bg-terracotta hover:bg-terracotta-hover text-warm-white font-medium text-sm shadow-warm-sm flex items-center gap-2 transition"
                >
                  <span>Continue Memory Journey</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => setupGame(level)}
                  className="px-5 py-3 rounded-pill bg-cream hover:bg-cream-dark text-charcoal font-medium text-sm border border-charcoal/15 transition"
                >
                  Replay Level {level}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4x4 or Adaptive Card Grid */}
        {!isWon && (
          <div className={`grid ${LEVELS[level].cols} gap-3 sm:gap-4 w-full max-w-2xl perspective-1000 my-auto`}>
            {cards.map((card, idx) => {
              const isCardFlipped = flipped.includes(idx) || matched.includes(card.id);
              const isCardMatched = matched.includes(card.id);

              return (
                <div
                  key={card.uniqueId}
                  role="button"
                  tabIndex={0}
                  aria-label={`Card ${idx + 1}: ${isCardFlipped ? card.name : 'Hidden card, tap to flip'}`}
                  onClick={() => handleCardClick(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(idx);
                    }
                  }}
                  className="relative aspect-square cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-terracotta rounded-card"
                  style={{ minWidth: '56px', minHeight: '56px' }}
                >
                  <div
                    className={`w-full h-full rounded-card transition-all duration-500 preserve-3d shadow-warm-sm ${
                      isCardFlipped ? 'rotate-y-180' : ''
                    } ${
                      isCardMatched
                        ? 'ring-4 ring-gold/90 ring-offset-2 scale-[0.98]'
                        : 'border border-charcoal/15 hover:border-terracotta/50'
                    }`}
                  >
                    {/* BACK OF CARD (Face Down - Glowing Terracotta & Gold Pattern) */}
                    <div className="absolute inset-0 backface-hidden rounded-card bg-gradient-to-br from-cream-card via-warm-white to-cream border-2 border-terracotta/20 flex flex-col items-center justify-center p-3 text-center hover:shadow-glow-gold transition-shadow">
                      {/* Calm mandala / floral ornament */}
                      <div className="w-12 h-12 rounded-full border border-dashed border-terracotta/40 flex items-center justify-center text-terracotta/70 mb-1">
                        <Sparkles size={20} className="text-gold" />
                      </div>
                      <span className="font-serif text-[10px] sm:text-xs font-semibold tracking-wider text-charcoal/50 uppercase">
                        Smriti
                      </span>
                    </div>

                    {/* FRONT OF CARD (Face Up - Cropped Authentic Icon) */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-card bg-cream border-2 border-gold/40 flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                      <div className="w-full h-3/4 flex items-center justify-center overflow-hidden rounded-soft mb-1">
                        <img
                          src={card.src}
                          alt={card.name}
                          className="w-full h-full object-cover object-center rounded-soft"
                          loading="lazy"
                        />
                      </div>
                      <span className="font-serif text-[11px] sm:text-xs font-bold text-charcoal truncate w-full px-1">
                        {card.name}
                      </span>
                      {isCardMatched && (
                        <div className="absolute top-1.5 right-1.5 text-sage">
                          <CheckCircle size={15} fill="#EFF3EB" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Footer Disclaimer & Guidance */}
      <div className="bg-warm-white px-6 py-3 border-t border-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-charcoal/60">
        <div className="flex items-center gap-1.5 text-charcoal/70">
          <Shield size={13} className="text-sage flex-shrink-0" />
          <span>Smriti Sathi supports cognitive engagement ? it does not diagnose or treat any medical condition.</span>
        </div>
        <span className="font-medium text-terracotta/80">
          AI Adaptive Calibration Active
        </span>
      </div>
    </div>
  );
}
