import React, { useEffect, useState } from 'react';
import { CheckCircle2, Heart, RotateCcw, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cognitiveStore } from '../lib/store/cognitiveStore';

export default function PersonalMemoryGame({ capsule, onClose }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [complete, setComplete] = useState(false);

  const setup = () => {
    const prompts = [
      { id: 'person', label: capsule?.subject || 'Someone special', detail: 'A familiar face' },
      { id: 'place', label: capsule?.place || 'A cherished place', detail: 'A treasured moment' },
      { id: 'feeling', label: capsule?.feeling || 'A happy memory', detail: 'A feeling to revisit' },
    ];
    const deck = prompts.flatMap((card) => [
      { ...card, instanceId: `${card.id}-a`, type: 'image' },
      { ...card, instanceId: `${card.id}-b`, type: 'prompt' },
    ]).sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setComplete(false);
  };

  useEffect(() => {
    setup();
  }, [capsule]);

  const choose = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index]?.id)) return;
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length !== 2) return;
    setMoves((value) => value + 1);
    const first = cards[next[0]];
    const second = cards[next[1]];
    if (first.id === second.id) {
      setTimeout(() => {
        const nextMatched = [...matched, first.id];
        setMatched(nextMatched);
        setFlipped([]);
        if (nextMatched.length === 3) {
          setComplete(true);
          cognitiveStore.recordActivity({
            title: `Personal Memory: ${capsule.title}`,
            result: `Recalled ${nextMatched.length} personal memory cues in ${moves + 1} moves`,
            accuracy: Math.max(60, Math.round((3 / (moves + 1)) * 100)),
            mistakes: Math.max(0, moves + 1 - 3),
            duration: '5 min',
            level: cognitiveStore.getState().user.currentLevel,
          });
          cognitiveStore.completeCarePlanStep('Personal memory activity');
          window.dispatchEvent(new CustomEvent('sathi-game-completed', {
            detail: { accuracy: 100, mistakes: Math.max(0, moves + 1 - 3), seconds: 300, level: cognitiveStore.getState().user.currentLevel }
          }));
        }
      }, 450);
    } else {
      setTimeout(() => setFlipped([]), 900);
    }
  };

  return (
    <div className="min-h-screen w-full bg-cream text-charcoal flex flex-col">
      <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-10 border-b border-charcoal/10 bg-warm-white">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta font-semibold">Sathi Memory Studio</p>
          <h1 className="font-serif text-2xl sm:text-3xl">{capsule?.title || 'A personal memory moment'}</h1>
          <p className="text-xs text-charcoal/60 mt-1">A gentle activity generated from a memory your family chose.</p>
        </div>
        <button onClick={onClose} className="p-3 rounded-full border border-charcoal/15 hover:bg-terracotta-light" aria-label="Close activity" title="Close activity"><X size={20} /></button>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-8 sm:px-10 grid lg:grid-cols-[minmax(260px,0.8fr)_1.2fr] gap-8 items-center">
        <section className="relative overflow-hidden rounded-card border border-terracotta/20 shadow-warm-lg bg-warm-white min-h-[300px]">
          {capsule?.image ? <img src={capsule.image} alt={capsule.title} className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-terracotta-light" />}
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-charcoal/80 to-transparent text-warm-white pt-20">
            <p className="text-xs uppercase tracking-wider text-gold-light">Memory capsule</p>
            <p className="font-serif text-xl">{capsule?.story || 'A moment worth remembering together.'}</p>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div><p className="text-xs uppercase tracking-wider text-terracotta font-semibold">Personalized recall</p><h2 className="font-serif text-2xl sm:text-3xl">Find the memory pairs</h2></div>
            <button onClick={setup} className="p-3 rounded-full border border-charcoal/15 hover:bg-cream" title="Restart activity" aria-label="Restart activity"><RotateCcw size={18} /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cards.map((card, index) => {
              const open = flipped.includes(index) || matched.includes(card.id);
              return <motion.button key={card.instanceId} whileTap={{ scale: 0.96 }} onClick={() => choose(index)} className={`aspect-square rounded-soft border-2 p-3 text-left flex flex-col justify-between transition ${open ? 'bg-warm-white border-terracotta' : 'bg-cream-card border-charcoal/10 hover:border-terracotta/50'}`}>
                <span className="text-[10px] uppercase tracking-wider text-charcoal/45">{card.type === 'image' ? 'Memory' : 'Cue'}</span>
                {open ? <><strong className="font-serif text-lg leading-tight">{card.label}</strong><span className="text-xs text-charcoal/60">{card.detail}</span></> : <Sparkles className="text-terracotta/60 self-center" size={28} />}
                {matched.includes(card.id) && <CheckCircle2 className="text-sage self-end" size={17} />}
              </motion.button>;
            })}
          </div>
          <div className="mt-5 flex items-center justify-between text-sm text-charcoal/65"><span>{matched.length} of 3 memories recalled</span><span>{moves} gentle attempts</span></div>
          {complete && <div className="mt-5 p-4 rounded-card bg-sage-light border border-sage/30 flex gap-3 items-start"><Heart className="text-sage-dark mt-0.5" size={20} fill="currentColor" /><div><p className="font-semibold">Memory moment completed</p><p className="text-sm text-charcoal/70">Sathi added this progress to the caregiver timeline.</p></div></div>}
        </section>
      </main>
    </div>
  );
}
