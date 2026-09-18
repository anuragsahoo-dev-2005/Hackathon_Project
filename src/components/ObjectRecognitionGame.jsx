import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, Eye, RotateCcw, Sparkles, X } from 'lucide-react';
import { GAME_ICONS } from './gameIconsData';
import { cognitiveStore } from '../lib/store/cognitiveStore';

const MIN_OPTIONS = 3;
const MAX_OPTIONS = 5;
const SHOW_MS = 2400;
const PAUSE_MS = 1000;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function chooseTarget() {
  return GAME_ICONS[Math.floor(Math.random() * GAME_ICONS.length)];
}

export default function ObjectRecognitionGame({ onClose }) {
  const [phase, setPhase] = useState('idle');
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [optionCount, setOptionCount] = useState(MIN_OPTIONS);
  const [selectedId, setSelectedId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [adaptiveMessage, setAdaptiveMessage] = useState('');
  const responseStartedAt = useRef(0);

  useEffect(() => {
    if (phase !== 'show') return undefined;
    const timer = window.setTimeout(() => setPhase('pause'), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'pause') return undefined;
    const timer = window.setTimeout(() => {
      const decoys = shuffle(GAME_ICONS.filter((icon) => icon.id !== target.id)).slice(0, optionCount - 1);
      setOptions(shuffle([target, ...decoys]));
      responseStartedAt.current = Date.now();
      setPhase('recall');
    }, PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, optionCount, target]);

  const startRound = (nextOptionCount = optionCount) => {
    const nextTarget = chooseTarget();
    setTarget(nextTarget);
    setOptionCount(nextOptionCount);
    setOptions([]);
    setSelectedId(null);
    setIsCorrect(false);
    setResponseTime(0);
    setAdaptiveMessage('');
    setPhase('show');
  };

  const handleAnswer = (icon) => {
    if (phase !== 'recall') return;
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - responseStartedAt.current) / 1000));
    const correct = icon.id === target.id;
    const performedStrongly = correct && elapsedSeconds <= 4;
    const nextOptionCount = performedStrongly
      ? Math.min(optionCount + 1, MAX_OPTIONS)
      : correct
        ? optionCount
        : Math.max(optionCount - 1, MIN_OPTIONS);

    setSelectedId(icon.id);
    setIsCorrect(correct);
    setResponseTime(elapsedSeconds);
    setOptionCount(nextOptionCount);
    setAdaptiveMessage(
      performedStrongly && nextOptionCount > optionCount
        ? 'You are doing well — let’s add one more option to choose from.'
        : correct
          ? 'That’s right — we’ll keep this comfortable for now.'
          : 'That’s alright — here’s the one we saw. Let’s keep this simple for now.'
    );
    setPhase('feedback');

    cognitiveStore.recordActivity({
      title: 'Object Recognition',
      result: correct ? `Recognised ${target.name}` : `Practised recognising ${target.name}`,
      accuracy: correct ? 100 : 0,
      mistakes: correct ? 0 : 1,
      duration: `${elapsedSeconds}s`,
      level: nextOptionCount
    });
  };

  const phaseTitle = {
    idle: 'Ready when you are',
    show: 'Remember this',
    pause: 'Take a quiet breath',
    recall: 'Which object did you see earlier?',
    feedback: isCorrect ? 'That’s right' : 'A thoughtful try'
  }[phase];

  return (
    <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[24px] border border-charcoal/10 bg-warm-white text-charcoal shadow-warm-lg">
      <header className="flex items-start justify-between gap-4 border-b border-charcoal/10 bg-cream/90 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-light text-sage-dark">
            <Eye size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">Object recognition</p>
            <h2 className="font-serif text-xl font-bold leading-tight sm:text-2xl">A gentle moment of noticing</h2>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-full p-2 text-charcoal/60 transition hover:bg-charcoal/10 hover:text-charcoal" aria-label="Close object recognition game">
            <X size={21} />
          </button>
        )}
      </header>

      <main className="px-5 py-7 sm:px-10 sm:py-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-charcoal/70">
          <span className="rounded-full bg-cream px-3 py-1.5 font-semibold">Choices: {optionCount}</span>
          {phase !== 'idle' && <span className="flex items-center gap-1.5"><Clock3 size={16} /> Take your time</span>}
        </div>

        <div className="min-h-[350px] text-center">
          <h3 className="font-serif text-2xl font-bold sm:text-3xl">{phaseTitle}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-charcoal/70 sm:text-base">
            {phase === 'idle' && 'Notice one familiar object, then choose it from a few gentle options.'}
            {phase === 'show' && 'Look closely. There is no rush.'}
            {phase === 'pause' && 'The choices will appear in just a moment.'}
            {phase === 'recall' && `Choose the object you remember from ${optionCount} options.`}
            {phase === 'feedback' && adaptiveMessage}
          </p>

          {phase === 'idle' && (
            <button onClick={() => startRound()} className="mt-12 inline-flex min-h-14 items-center gap-2 rounded-full bg-terracotta px-7 py-3 text-base font-semibold text-warm-white shadow-warm-sm transition duration-500 hover:bg-terracotta-hover">
              Begin gently <ArrowRight size={18} />
            </button>
          )}

          {(phase === 'show' || phase === 'pause') && (
            <div className="mx-auto mt-8 flex h-60 max-w-md items-center justify-center rounded-[20px] bg-cream/80 transition duration-700">
              {phase === 'show' ? (
                <img src={target.src} alt={target.sub || target.name} className="h-52 w-72 rounded-xl object-cover shadow-warm-sm transition duration-700" />
              ) : <span className="font-serif text-xl text-terracotta">Breathe in, and get ready...</span>}
            </div>
          )}

          {phase === 'recall' && (
            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {options.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => handleAnswer(icon)}
                  className="group flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-charcoal/10 bg-cream p-3 transition duration-500 hover:-translate-y-0.5 hover:border-terracotta/60 hover:shadow-warm-sm focus:outline-none focus:ring-4 focus:ring-gold/40"
                  aria-label={`Choose ${icon.name}, ${icon.sub}`}
                >
                  <img src={icon.src} alt="" className="h-24 w-full rounded-xl object-cover" />
                  <span className="text-sm font-semibold text-charcoal/80">{icon.name}</span>
                </button>
              ))}
            </div>
          )}

          {phase === 'feedback' && (
            <div className={`mx-auto mt-8 max-w-lg rounded-[20px] border p-6 ${isCorrect ? 'border-sage/40 bg-sage-light/50' : 'border-gold/40 bg-gold-light/40'}`}>
              <div className="flex justify-center text-sage-dark">{isCorrect ? <CheckCircle2 size={36} /> : <Sparkles size={36} className="text-gold-dark" />}</div>
              {!isCorrect && <img src={target.src} alt={target.sub || target.name} className="mx-auto mt-4 h-36 w-52 rounded-xl object-cover shadow-warm-sm" />}
              <p className="mt-3 text-sm text-charcoal/75">Response time: {responseTime} seconds</p>
              <button onClick={() => startRound(optionCount)} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 font-semibold text-warm-white transition duration-500 hover:bg-terracotta-hover">
                <RotateCcw size={17} /> Continue gently
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
