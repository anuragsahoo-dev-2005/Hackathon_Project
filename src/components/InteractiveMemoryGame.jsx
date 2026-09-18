import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Sparkles, Trophy, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { chime } from './AudioChime';

const BOTANICAL_PAIRS = [
  {
    id: 'marigold',
    name: 'Genda (Marigold)',
    meaning: 'Vitality & Festivity',
    color: '#E68A2E',
    icon: (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <circle cx="50" cy="50" r="38" fill="#F5A623" opacity="0.25"/>
        <g fill="#D4731E">
          <circle cx="50" cy="30" r="14" opacity="0.8"/>
          <circle cx="68" cy="40" r="14" opacity="0.8"/>
          <circle cx="68" cy="62" r="14" opacity="0.8"/>
          <circle cx="50" cy="72" r="14" opacity="0.8"/>
          <circle cx="32" cy="62" r="14" opacity="0.8"/>
          <circle cx="32" cy="40" r="14" opacity="0.8"/>
        </g>
        <circle cx="50" cy="50" r="16" fill="#F9A03F"/>
        <circle cx="50" cy="50" r="8" fill="#C1653A"/>
      </svg>
    )
  },
  {
    id: 'lotus',
    name: 'Kamal (Lotus)',
    meaning: 'Purity & Calm',
    color: '#D46A88',
    icon: (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <circle cx="50" cy="50" r="38" fill="#E892A8" opacity="0.25"/>
        <path d="M50 20 C60 40 75 60 50 82 C25 60 40 40 50 20 Z" fill="#D46A88" opacity="0.9"/>
        <path d="M50 35 C68 48 78 68 50 82 C22 68 32 48 50 35 Z" fill="#F09FB5" opacity="0.75"/>
        <circle cx="50" cy="74" r="5" fill="#C1653A"/>
      </svg>
    )
  },
  {
    id: 'jasmine',
    name: 'Mogra (Jasmine)',
    meaning: 'Peaceful Reminiscence',
    color: '#658B78',
    icon: (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <circle cx="50" cy="50" r="38" fill="#8B9A7A" opacity="0.25"/>
        <g fill="#FFFDF9" stroke="#8B9A7A" strokeWidth="1.5">
          <ellipse cx="50" cy="30" rx="9" ry="18"/>
          <ellipse cx="69" cy="44" rx="9" ry="18" transform="rotate(72 69 44)"/>
          <ellipse cx="62" cy="68" rx="9" ry="18" transform="rotate(144 62 68)"/>
          <ellipse cx="38" cy="68" rx="9" ry="18" transform="rotate(216 38 68)"/>
          <ellipse cx="31" cy="44" rx="9" ry="18" transform="rotate(288 31 44)"/>
        </g>
        <circle cx="50" cy="50" r="6" fill="#D4A24C"/>
      </svg>
    )
  }
];

export default function InteractiveMemoryGame({ isCompact = false }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize deck with 6 shuffled cards
  const initializeGame = () => {
    const deck = [];
    BOTANICAL_PAIRS.forEach((item) => {
      deck.push({ instanceId: `${item.id}-1`, ...item });
      deck.push({ instanceId: `${item.id}-2`, ...item });
    });
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (index) => {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index].id)) return;

    if (soundEnabled) chime.playFlip();
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.id === secondCard.id) {
        // Matched!
        setTimeout(() => {
          if (soundEnabled) chime.playMatch();
          setMatched((prev) => {
            const next = [...prev, firstCard.id];
            if (next.length === BOTANICAL_PAIRS.length) {
              // Game won!
              setTimeout(() => {
                if (soundEnabled) chime.playWin();
                setIsWon(true);
                confetti({
                  particleCount: 75,
                  spread: 60,
                  origin: { y: 0.7 },
                  colors: ['#C1653A', '#D4A24C', '#8B9A7A', '#FBF6EE']
                });
              }, 400);
            }
            return next;
          });
          setFlipped([]);
        }, 450);
      } else {
        // No match - flip back
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    chime.muted = !next;
  };

  return (
    <div className="relative w-full max-w-md mx-auto bg-warm-white/90 backdrop-blur-xl rounded-card p-5 md:p-6 shadow-warm-lg border border-terracotta/20 text-charcoal">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 border-b border-charcoal/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-terracotta"></span>
          </span>
          <span className="text-xs font-semibold tracking-wider text-charcoal/80 uppercase">
            Cognitive Recall Test
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="p-1.5 rounded-full hover:bg-cream transition-colors text-charcoal/70 hover:text-charcoal"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={initializeGame}
            title="Reset cards"
            className="flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-hover font-medium px-2 py-1 rounded-pill hover:bg-terracotta/10 transition"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Subtitle / Instructions */}
      <div className="flex items-center justify-between text-xs text-charcoal/70 mb-3 px-1">
        <span>Tap to match beloved botanical blossoms:</span>
        <span className="font-semibold text-charcoal">
          Pairs: {matched.length}/{BOTANICAL_PAIRS.length} · Moves: {moves}
        </span>
      </div>

      {/* 6 Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 md:gap-3 perspective-1000">
        {cards.map((card, idx) => {
          const isCardFlipped = flipped.includes(idx) || matched.includes(card.id);
          const isCardMatched = matched.includes(card.id);

          return (
            <motion.div
              key={card.instanceId}
              whileHover={{ scale: isCardMatched ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCardClick(idx)}
              className="relative h-28 md:h-32 cursor-pointer select-none"
            >
              <div
                className={`w-full h-full rounded-soft transition-all duration-500 preserve-3d shadow-warm-sm ${
                  isCardFlipped ? 'rotate-y-180' : ''
                } ${isCardMatched ? 'ring-2 ring-gold/80 ring-offset-1' : 'border border-charcoal/10'}`}
              >
                {/* Back of Card (Face Down) */}
                <div className="absolute inset-0 backface-hidden rounded-soft bg-cream-card flex flex-col items-center justify-center p-2 border border-terracotta/15 hover:border-terracotta/40 transition-colors">
                  <div className="w-10 h-10 rounded-full border border-dashed border-terracotta/30 flex items-center justify-center text-terracotta/60 mb-1">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-[10px] font-medium tracking-wider text-charcoal/60 uppercase">
                    Memory
                  </span>
                </div>

                {/* Front of Card (Face Up) */}
                <div
                  className="absolute inset-0 backface-hidden rotate-y-180 rounded-soft bg-warm-white flex flex-col items-center justify-center p-2 text-center border-2"
                  style={{ borderColor: isCardMatched ? card.color : '#C1653A22' }}
                >
                  <div className="mb-1">{card.icon}</div>
                  <div className="text-[11px] font-serif font-bold text-charcoal leading-tight">
                    {card.name.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-charcoal/60 leading-tight">
                    {card.name.split(' ')[1] || ''}
                  </div>
                  {isCardMatched && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 text-gold"
                    >
                      <CheckCircle2 size={13} />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Win Banner */}
      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3.5 p-3 rounded-soft bg-sage-light border border-sage/40 flex items-center justify-between text-charcoal"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-sage text-warm-white">
                <Trophy size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal">
                  Memory Spark Activated!
                </p>
                <p className="text-[11px] text-charcoal/70">
                  Completed in {moves} moves. Gentle recall stimulated.
                </p>
              </div>
            </div>
            <button
              onClick={initializeGame}
              className="text-xs font-semibold bg-terracotta hover:bg-terracotta-hover text-warm-white px-3 py-1.5 rounded-pill shadow-warm-sm transition"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer hint */}
      <p className="mt-3 text-[11px] text-center text-charcoal/60">
        Adaptive sensory games crafted for seniors to encourage joyous daily recall.
      </p>
    </div>
  );
}
