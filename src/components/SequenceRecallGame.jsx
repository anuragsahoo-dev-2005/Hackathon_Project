import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Brain, CheckCircle2, Clock3, RotateCcw, Sparkles, X } from 'lucide-react';
import { cognitiveStore } from '../lib/store/cognitiveStore';

const SEQUENCE_ICONS = Array.from({ length: 23 }, (_, index) => ({
  id: `seq-icon-${String(index + 1).padStart(2, '0')}`,
  src: `/images/sequence-icons/seq-icon-${String(index + 1).padStart(2, '0')}.png`,
  name: [
    'Blue orchid', 'Rhododendron', 'Marigold', 'Hibiscus', 'Water lily',
    'Orange', 'Pineapple', 'Bananas', 'Guava', 'Lychee',
    'Brass pot', 'Woven basket', 'Clay pot', 'Oil lamp', 'Hand fan',
    'Tea', 'Rice bowl', 'Bamboo shoots', 'Traditional towel', 'Woven textile',
    'Sun hat', 'Tea leaves', 'Hornbill'
  ][index]
}));

const MIN_LENGTH = 3;
const MAX_LENGTH = 6;
const SHOW_MS = 1700;
const TURN_PAUSE_MS = 1100;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function chooseIcons(count) {
  return shuffle(SEQUENCE_ICONS).slice(0, count);
}

export default function SequenceRecallGame({ onClose }) {
  const [roundLength, setRoundLength] = useState(MIN_LENGTH);
  const [phase, setPhase] = useState('idle');
  const [sequence, setSequence] = useState([]);
  const [options, setOptions] = useState([]);
  const [showIndex, setShowIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [adaptiveMessage, setAdaptiveMessage] = useState('');
  const [tapFeedback, setTapFeedback] = useState('');
  const responseStartedAt = useRef(0);

  useEffect(() => {
    if (phase !== 'show') return undefined;
    const timer = window.setTimeout(() => {
      if (showIndex < sequence.length - 1) {
        setShowIndex((index) => index + 1);
      } else {
        setPhase('turn');
      }
    }, SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [phase, sequence.length, showIndex]);

  useEffect(() => {
    if (phase !== 'turn') return undefined;
    const timer = window.setTimeout(() => {
      const decoys = shuffle(SEQUENCE_ICONS.filter((icon) => !sequence.some((item) => item.id === icon.id)))
        .slice(0, 3);
      setOptions(shuffle([...sequence, ...decoys]));
      responseStartedAt.current = Date.now();
      setPhase('recall');
    }, TURN_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, sequence]);

  const startRound = (length = roundLength) => {
    setRoundLength(length);
    setSequence(chooseIcons(length));
    setOptions([]);
    setSelected([]);
    setShowIndex(0);
    setTapFeedback('');
    setAdaptiveMessage('');
    setPhase('show');
  };

  const finishRound = (correct, elapsedSeconds) => {
    const nextLength = correct && elapsedSeconds <= roundLength * 4
      ? Math.min(roundLength + 1, MAX_LENGTH)
      : correct
        ? roundLength
        : Math.max(roundLength - 1, MIN_LENGTH);

    setWasCorrect(correct);
    setResponseTime(elapsedSeconds);
    setRoundLength(nextLength);
    setPhase('result');
    setAdaptiveMessage(
      correct && nextLength > roundLength
        ? 'Nicely done — let’s try a slightly longer sequence next time.'
        : correct
          ? 'Well remembered — we’ll keep this comfortable next time.'
          : 'That’s alright — let’s keep the next one a little shorter for now.'
    );

    cognitiveStore.recordActivity({
      title: 'Sequence Recall',
      result: correct ? `Recalled ${roundLength} icons` : `Practised a ${roundLength}-icon sequence`,
      accuracy: correct ? 100 : 0,
      mistakes: correct ? 0 : 1,
      duration: `${elapsedSeconds}s`,
      level: nextLength
    });
  };

  const handleSelect = (icon) => {
    if (phase !== 'recall' || selected.some((item) => item.id === icon.id)) return;

    const nextSelected = [...selected, icon];
    const expected = sequence[nextSelected.length - 1];
    const isExpected = expected.id === icon.id;
    setSelected(nextSelected);
    setTapFeedback(isExpected ? `${icon.name} is in the right place.` : `${icon.name} noted. Keep going at your own pace.`);

    if (nextSelected.length === sequence.length) {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - responseStartedAt.current) / 1000));
      const correct = nextSelected.every((item, index) => item.id === sequence[index].id);
      window.setTimeout(() => finishRound(correct, elapsedSeconds), 500);
    }
  };

  const phaseTitle = {
    idle: 'Ready when you are',
    show: 'Notice the order',
    turn: 'Your turn is coming',
    recall: 'Which came first?',
    result: wasCorrect ? 'Well remembered' : 'A thoughtful try'
  }[phase];

  return (
    <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-[24px] border border-charcoal/10 bg-warm-white text-charcoal shadow-warm-lg">
      <header className="flex items-start justify-between gap-4 border-b border-charcoal/10 bg-cream/90 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-terracotta">
            <Brain size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">Sequence recall</p>
            <h2 className="font-serif text-xl font-bold leading-tight sm:text-2xl">A calm moment for memory</h2>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-full p-2 text-charcoal/60 transition hover:bg-charcoal/10 hover:text-charcoal" aria-label="Close sequence recall game">
            <X size={21} />
          </button>
        )}
      </header>

      <main className="px-5 py-7 sm:px-10 sm:py-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-charcoal/70">
          <span className="rounded-full bg-cream px-3 py-1.5 font-semibold">Round length: {roundLength}</span>
          {phase !== 'idle' && phase !== 'result' && <span className="flex items-center gap-1.5"><Clock3 size={16} /> Take your time</span>}
        </div>

        <div className="min-h-[330px] text-center">
          <h3 className="font-serif text-2xl font-bold sm:text-3xl">{phaseTitle}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-charcoal/70 sm:text-base">
            {phase === 'idle' && 'You will see a few familiar objects, one at a time. Then choose them in the same order.'}
            {phase === 'show' && `Remember icon ${showIndex + 1} of ${sequence.length}.`}
            {phase === 'turn' && 'The choices will appear in just a moment.'}
            {phase === 'recall' && `Choose ${sequence.length} icons in the order you saw them.`}
            {phase === 'result' && adaptiveMessage}
          </p>

          {phase === 'idle' && (
            <button onClick={() => startRound()} className="mt-12 inline-flex min-h-14 items-center gap-2 rounded-full bg-terracotta px-7 py-3 text-base font-semibold text-warm-white shadow-warm-sm transition duration-500 hover:bg-terracotta-hover">
              Begin gently <ArrowRight size={18} />
            </button>
          )}

          {(phase === 'show' || phase === 'turn') && (
            <div className="mx-auto mt-8 flex h-56 max-w-md items-center justify-center rounded-[20px] bg-cream/80 transition duration-700">
              {phase === 'show' ? (
                <img src={sequence[showIndex].src} alt={sequence[showIndex].name} className="h-48 w-64 rounded-xl object-cover shadow-warm-sm transition duration-700" />
              ) : <span className="font-serif text-xl text-terracotta">Breathe in, and get ready...</span>}
            </div>
          )}

          {phase === 'recall' && (
            <div className="mx-auto mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
              {options.map((icon) => {
                const picked = selected.some((item) => item.id === icon.id);
                return (
                  <button
                    key={icon.id}
                    onClick={() => handleSelect(icon)}
                    disabled={picked}
                    className={`group flex min-h-[124px] flex-col items-center justify-center gap-2 rounded-[18px] border-2 bg-cream p-2 transition duration-500 sm:min-h-[140px] ${picked ? 'border-gold bg-gold-light/50 opacity-75' : 'border-charcoal/10 hover:-translate-y-0.5 hover:border-terracotta/60 hover:shadow-warm-sm'}`}
                    aria-label={`Choose ${icon.name}`}
                  >
                    <img src={icon.src} alt="" className="h-20 w-full rounded-xl object-cover sm:h-24" />
                    <span className="text-xs font-semibold text-charcoal/80">{picked ? 'Chosen' : icon.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {phase === 'recall' && tapFeedback && <p aria-live="polite" className="mt-5 text-sm font-medium text-sage-dark">{tapFeedback}</p>}

          {phase === 'result' && (
            <div className={`mx-auto mt-8 max-w-lg rounded-[20px] border p-6 ${wasCorrect ? 'border-sage/40 bg-sage-light/50' : 'border-gold/40 bg-gold-light/40'}`}>
              <div className="flex justify-center text-sage-dark">{wasCorrect ? <CheckCircle2 size={34} /> : <Sparkles size={34} className="text-gold-dark" />}</div>
              <p className="mt-3 text-sm text-charcoal/75">Response time: {responseTime} seconds</p>
              <button onClick={() => startRound(roundLength)} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 font-semibold text-warm-white transition duration-500 hover:bg-terracotta-hover">
                <RotateCcw size={17} /> Try another round
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 border-t border-charcoal/10 pt-4 text-center text-[11px] leading-relaxed text-charcoal/55">
          Smriti Sathi supports cognitive engagement — it does not diagnose or treat any medical condition.
        </p>
      </main>
    </div>
  );
}
