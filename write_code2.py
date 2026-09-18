import os

files = {}

# InteractiveMemoryGame.jsx
files["src/components/InteractiveMemoryGame.jsx"] = """import React, { useState, useEffect } from 'react';
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
"""

# Navbar.jsx
files["src/components/Navbar.jsx"] = """import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'lucide-react';
import { Menu, X, ArrowRight, Sparkles, Heart } from 'lucide-react';

export default function Navbar({ onOpenDemo }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isElderMode, setIsElderMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleElderMode = () => {
    setIsElderMode(!isElderMode);
    document.documentElement.classList.toggle('text-lg', !isElderMode);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-warm-white/90 backdrop-blur-md shadow-warm-sm border-b border-charcoal/10 py-3.5'
          : 'bg-warm-white/60 backdrop-blur-sm border-b border-charcoal/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* Logo left */}
        <a href="#hero" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-terracotta to-gold flex items-center justify-center text-warm-white shadow-warm-sm group-hover:scale-105 transition-transform">
            <Heart size={16} fill="#FFFDF9" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-2xl font-bold tracking-tight text-charcoal">
              SmritiSathi
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta"></span>
            </span>
          </div>
        </a>

        {/* Center Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-charcoal/80">
          <a href="#hero" className="hover:text-terracotta transition-colors">
            Home
          </a>
          <a href="#how-it-works" className="hover:text-terracotta transition-colors">
            How It Works
          </a>
          <a href="#for-seniors" className="hover:text-terracotta transition-colors">
            For Seniors
          </a>
          <a href="#for-caregivers" className="hover:text-terracotta transition-colors">
            For Caregivers
          </a>
          <a href="#impact" className="hover:text-terracotta transition-colors">
            Impact
          </a>
        </nav>

        {/* Right CTA + Accessibility (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Elder Mode text zoom accessibility button */}
          <button
            onClick={toggleElderMode}
            title="Toggle Senior Friendly Font Size"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-pill border border-charcoal/20 text-charcoal/70 hover:text-charcoal hover:border-charcoal/40 transition"
          >
            <span>{isElderMode ? 'A Regular' : 'A+ Large'}</span>
          </button>

          <a
            href="#for-caregivers"
            className="flex items-center gap-2 px-5 py-2.5 rounded-pill bg-terracotta hover:bg-terracotta-hover text-warm-white text-sm font-medium shadow-warm-sm transition-all duration-200 hover:shadow-glow-terracotta hover:-translate-y-0.5"
          >
            <span>Start Journey</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-charcoal/80 hover:text-charcoal"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-warm-white/95 backdrop-blur-xl border-b border-charcoal/10 px-6 py-5 flex flex-col gap-4 shadow-warm-lg">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-charcoal/90 hover:text-terracotta"
          >
            Home
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-charcoal/90 hover:text-terracotta"
          >
            How It Works
          </a>
          <a
            href="#for-seniors"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-charcoal/90 hover:text-terracotta"
          >
            For Seniors
          </a>
          <a
            href="#for-caregivers"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-charcoal/90 hover:text-terracotta"
          >
            For Caregivers
          </a>
          <a
            href="#impact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-charcoal/90 hover:text-terracotta"
          >
            Impact
          </a>

          <div className="pt-3 border-t border-charcoal/10 flex flex-col gap-2">
            <button
              onClick={() => {
                toggleElderMode();
                setMobileMenuOpen(false);
              }}
              className="text-center py-2 text-xs font-semibold rounded-pill border border-charcoal/20 text-charcoal/80"
            >
              Toggle Text Size ({isElderMode ? 'Regular' : 'Large A+'})
            </button>
            <a
              href="#for-caregivers"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-pill bg-terracotta text-warm-white text-sm font-medium text-center shadow-warm-sm"
            >
              <span>Start Journey</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
"""

# Hero.jsx
files["src/components/Hero.jsx"] = """import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, HeartHandshake, Globe, WifiOff, Play } from 'lucide-react';
import InteractiveMemoryGame from './InteractiveMemoryGame';

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-[92vh] lg:min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Full-bleed background image with subtle parallax feel */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-couple.jpg"
          alt="Dignified elderly Indian couple on a garden bench at golden hour"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Cinematic dark & warm gradient overlays on the left third for effortless text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 via-45% to-charcoal/20 lg:to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-charcoal/40 lg:hidden"></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Text & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 text-warm-white"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-warm-white/10 backdrop-blur-md border border-warm-white/20 text-gold-light text-xs font-semibold tracking-eyebrow uppercase mb-5">
              <Sparkles size={13} className="text-gold" />
              <span>AI-POWERED COGNITIVE WELLNESS</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight mb-6 text-warm-white">
              Keep <span className="italic font-normal text-gold-light underline decoration-terracotta/60 decoration-wavy decoration-1 underline-offset-8">Memories</span> Alive.
            </h1>

            {/* Subhead */}
            <p className="text-lg sm:text-xl text-warm-white/90 leading-relaxed font-sans max-w-2xl mb-8 font-light">
              Personalized cognitive care that helps seniors stay active, connected and supported — one meaningful moment at a time.
            </p>

            {/* Two Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <a
                href="#for-caregivers"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-pill bg-terracotta hover:bg-terracotta-hover text-warm-white font-medium text-base shadow-warm-lg hover:shadow-glow-terracotta transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Start a Memory Journey</span>
                <ArrowRight size={17} />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-pill bg-warm-white/10 hover:bg-warm-white/20 backdrop-blur-md border border-warm-white/30 text-warm-white font-medium text-base transition-all duration-200"
              >
                <Play size={14} className="text-gold fill-gold" />
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Trust row */}
            <div className="pt-6 border-t border-warm-white/15">
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs sm:text-sm text-warm-white/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-gold" />
                  AI-Assisted
                </span>
                <span className="text-warm-white/30">•</span>
                <span className="flex items-center gap-1.5">
                  <HeartHandshake size={14} className="text-terracotta-light" />
                  Elder-Friendly
                </span>
                <span className="text-warm-white/30">•</span>
                <span className="flex items-center gap-1.5">
                  <Globe size={14} className="text-sage-light" />
                  Multilingual
                </span>
                <span className="text-warm-white/30">•</span>
                <span className="flex items-center gap-1.5">
                  <WifiOff size={14} className="text-warm-white/70" />
                  Offline-Ready
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Live Interactive Demo Widget (The SIH Game Winner) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col items-center justify-center"
          >
            <div className="w-full relative">
              {/* Floating decorative badge */}
              <div className="absolute -top-3.5 left-4 z-20 px-3 py-1 rounded-pill bg-terracotta text-warm-white text-[11px] font-bold tracking-wider uppercase shadow-warm-sm flex items-center gap-1">
                <Sparkles size={11} />
                <span>Interactive Live Demo</span>
              </div>
              <InteractiveMemoryGame />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
"""

for filepath, content in files.items():
    dirname = os.path.dirname(filepath)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Wrote:", filepath)
