import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Volume2, VolumeX, X, Shield, Eye } from "lucide-react";

// ─── Scene Config ─────────────────────────────────────────────────────────────
// Each file is a side-by-side composite: left half = original, right half = changed.
// answerX / answerY are % coords of the missing object within the LEFT half.
const SCENES = [
  {
    id: "baking",
    label: "Baking Table",
    file: "/images/which-one-changed/scene-01-baking.jpg",
    missingLabel: "the whisk",
    answerX: 60,
    answerY: 55,
  },
  {
    id: "embroidery",
    label: "Embroidery Desk",
    file: "/images/which-one-changed/scene-02-embroidery.jpg",
    missingLabel: "the tape measure",
    answerX: 20,
    answerY: 80,
  },
  {
    id: "crafts",
    label: "Kids' Craft Table",
    file: "/images/which-one-changed/scene-03-crafts.jpg",
    missingLabel: "the toy car",
    answerX: 12,
    answerY: 88,
  },
  {
    id: "travel",
    label: "Travel & Map Desk",
    file: "/images/which-one-changed/scene-04-travel.jpg",
    missingLabel: "the camera",
    answerX: 13,
    answerY: 32,
  },
  {
    id: "breakfast",
    label: "Breakfast Table",
    file: "/images/which-one-changed/scene-05-breakfast.jpg",
    missingLabel: "the keys",
    answerX: 34,
    answerY: 22,
  },
  {
    id: "writing",
    label: "Writing Desk",
    file: "/images/which-one-changed/scene-06-writing.jpg",
    missingLabel: "the succulent plant",
    answerX: 14,
    answerY: 38,
  },
  {
    id: "gardening",
    label: "Gardening Desk",
    file: "/images/which-one-changed/scene-07-gardening.jpg",
    missingLabel: "the watering can",
    answerX: 18,
    answerY: 22,
  },
];

const INITIAL_RADIUS = 22;
const MIN_RADIUS = 10;
const MAX_RADIUS = 30;

const PHASE = {
  INTRO: "intro",
  SHOW_ORIGINAL: "show_original",
  BLANK: "blank",
  SHOW_CHANGED: "show_changed",
  AWAITING_TAP: "awaiting_tap",
  FEEDBACK: "feedback",
};

function playTone(freq = 440, duration = 0.3, type = "sine", volume = 0.18) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.05);
  } catch (_) {}
}

export default function WhichOneChangedGame({ onClose }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [correctRadius, setCorrectRadius] = useState(INITIAL_RADIUS);
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [adaptiveMessage, setAdaptiveMessage] = useState(null);
  const [tapResult, setTapResult] = useState(null);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [reticle, setReticle] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);
  const phaseTimer = useRef(null);

  const scene = SCENES[sceneIndex % SCENES.length];

  const clearTimer = () => {
    if (phaseTimer.current) clearTimeout(phaseTimer.current);
  };

  const goToPhase = useCallback((p, delay = 0) => {
    clearTimer();
    if (delay > 0) {
      phaseTimer.current = setTimeout(() => setPhase(p), delay);
    } else {
      setPhase(p);
    }
  }, []);

  useEffect(() => {
    if (phase === PHASE.SHOW_ORIGINAL) {
      setRoundStartTime(Date.now());
      goToPhase(PHASE.BLANK, 4500);
    } else if (phase === PHASE.BLANK) {
      goToPhase(PHASE.SHOW_CHANGED, 900);
    } else if (phase === PHASE.SHOW_CHANGED) {
      goToPhase(PHASE.AWAITING_TAP, 2800);
    }
    return clearTimer;
  }, [phase, goToPhase]);

  const startRound = useCallback((idx) => {
    clearTimer();
    setSceneIndex(idx);
    setTapResult(null);
    setAdaptiveMessage(null);
    setReticle({ x: 50, y: 50 });
    setTimeout(() => setPhase(PHASE.SHOW_ORIGINAL), 50);
  }, []);

  const handleStart = () => startRound(0);
  const handleNextRound = () => startRound((sceneIndex + 1) % SCENES.length);

  const evaluateTap = useCallback(
    (tapXpct, tapYpct) => {
      if (phase !== PHASE.AWAITING_TAP) return;
      const elapsed = roundStartTime ? (Date.now() - roundStartTime) / 1000 : 10;
      const dx = tapXpct - scene.answerX;
      const dy = tapYpct - scene.answerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isCorrect = dist <= correctRadius;

      setTapResult({ x: tapXpct, y: tapYpct, isCorrect });
      setPhase(PHASE.FEEDBACK);

      if (soundEnabled) {
        if (isCorrect) playTone(660, 0.4, "sine");
        else playTone(280, 0.5, "triangle");
      }

      setStats((prev) => {
        const newStreak = isCorrect ? prev.streak + 1 : 0;
        let newRadius = correctRadius;
        let msg = null;

        if (newStreak >= 3 && elapsed < 8 && correctRadius > MIN_RADIUS) {
          newRadius = Math.max(MIN_RADIUS, correctRadius - 3);
          msg = "You're spotting these precisely — let's make it a touch more challenging.";
        } else if (!isCorrect && correctRadius < MAX_RADIUS) {
          newRadius = Math.min(MAX_RADIUS, correctRadius + 4);
          msg = "Let's keep this a little more forgiving for now.";
        }

        setCorrectRadius(newRadius);
        setAdaptiveMessage(msg);
        return {
          correct: isCorrect ? prev.correct + 1 : prev.correct,
          total: prev.total + 1,
          streak: newStreak,
        };
      });
    },
    [phase, scene, correctRadius, roundStartTime, soundEnabled]
  );

  const handleImageTap = (e) => {
    if (phase !== PHASE.AWAITING_TAP) return;
    e.preventDefault();
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;
    evaluateTap(xPct, yPct);
  };

  useEffect(() => {
    const STEP = 3;
    const handler = (e) => {
      if (phase !== PHASE.AWAITING_TAP) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); setReticle((r) => ({ ...r, x: Math.max(0, r.x - STEP) })); }
      if (e.key === "ArrowRight") { e.preventDefault(); setReticle((r) => ({ ...r, x: Math.min(100, r.x + STEP) })); }
      if (e.key === "ArrowUp") { e.preventDefault(); setReticle((r) => ({ ...r, y: Math.max(0, r.y - STEP) })); }
      if (e.key === "ArrowDown") { e.preventDefault(); setReticle((r) => ({ ...r, y: Math.min(100, r.y + STEP) })); }
      if (e.key === "Enter") evaluateTap(reticle.x, reticle.y);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, reticle, evaluateTap]);

  const roundNum = (sceneIndex % SCENES.length) + 1;
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return (
    <div className="relative flex flex-col rounded-[24px] border border-[#2B2420]/10 bg-[#FBF6EE] text-[#2B2420] shadow-2xl" style={{ minHeight: 520 }}>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2B2420]/8 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C1653A]/15 text-[#C1653A]">
            <Eye size={20} />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C1653A]">Which One Changed?</p>
            <p className="text-[13px] text-[#2B2420]/60">Round {roundNum} of {SCENES.length} · {scene.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled((s) => !s)} className="rounded-full p-2 text-[#2B2420]/50 transition hover:bg-[#2B2420]/10" aria-label={soundEnabled ? "Mute" : "Enable sounds"}>
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          {accuracy !== null && (
            <span className="rounded-full bg-[#8B9A7A]/20 px-3 py-1 text-xs font-semibold text-[#8B9A7A]">{accuracy}% accurate</span>
          )}
          <button onClick={() => startRound(0)} className="rounded-full p-2 text-[#2B2420]/50 transition hover:bg-[#2B2420]/10" aria-label="Restart">
            <RotateCcw size={18} />
          </button>
          {onClose && (
            <button onClick={onClose} className="rounded-full p-2 text-[#2B2420]/50 transition hover:bg-[#2B2420]/10" aria-label="Close">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-start px-4 pb-6 pt-5 sm:px-8">
        <AnimatePresence mode="wait">

          {phase === PHASE.INTRO && (
            <motion.div key="intro" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6 text-center max-w-lg w-full">
              <div className="mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#C1653A]/12 text-[#C1653A]">
                <Eye size={40} />
              </div>
              <h2 className="font-serif text-3xl font-bold sm:text-4xl">Which One Changed?</h2>
              <p className="text-base leading-relaxed text-[#2B2420]/70">
                You'll see a familiar scene, then it will change slightly. Tap where you think something went missing. Take your time — there's no rush.
              </p>
              <div className="grid gap-3 text-sm text-[#2B2420]/60 sm:grid-cols-3 w-full">
                {["Look closely at the scene", "Notice what's different", "Tap what's missing"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-2xl border border-[#C1653A]/15 bg-white/60 px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C1653A]/15 text-xs font-bold text-[#C1653A]">{i + 1}</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleStart}
                className="mt-2 rounded-full bg-[#C1653A] px-10 py-4 text-base font-semibold text-white shadow-md transition duration-300 hover:bg-[#a8532d] hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C1653A]/40">
                Let's Begin
              </button>
            </motion.div>
          )}

          {phase === PHASE.SHOW_ORIGINAL && (
            <motion.div key="original" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center gap-4">
              <p className="text-center text-base font-medium text-[#2B2420]/70">Take a look — study this scene carefully.</p>
              <SceneHalf src={scene.file} side="original" alt="Original scene" />
              <PhaseBar durationMs={4500} color="#C1653A" />
            </motion.div>
          )}

          {phase === PHASE.BLANK && (
            <motion.div key="blank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}
              className="flex h-64 w-full items-center justify-center">
              <p className="text-lg text-[#2B2420]/40 italic">Just a moment…</p>
            </motion.div>
          )}

          {phase === PHASE.SHOW_CHANGED && (
            <motion.div key="changed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center gap-4">
              <p className="text-center text-base font-medium text-[#2B2420]/70">Something changed. Do you see what's missing?</p>
              <SceneHalf src={scene.file} side="changed" alt="Changed scene" />
              <PhaseBar durationMs={2800} color="#D4A24C" />
            </motion.div>
          )}

          {phase === PHASE.AWAITING_TAP && (
            <motion.div key="tap" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
              className="flex w-full flex-col items-center gap-3">
              <p className="text-center text-base font-semibold text-[#2B2420]">What's missing? Tap where you think it was.</p>
              <p className="text-center text-xs text-[#2B2420]/45">Keyboard: arrow keys to move the ring · Enter to confirm</p>
              <div
                ref={imageRef}
                className="relative w-full cursor-crosshair overflow-hidden rounded-2xl shadow-md"
                style={{ maxWidth: 560 }}
                onClick={handleImageTap}
                onTouchEnd={handleImageTap}
                role="button"
                tabIndex={0}
                aria-label="Tap the image where the missing object was"
              >
                <SceneHalf src={scene.file} side="original" alt="Tap the missing object" inline />
                {/* Keyboard reticle */}
                <div className="pointer-events-none absolute" style={{ left: `${reticle.x}%`, top: `${reticle.y}%`, transform: "translate(-50%,-50%)" }}>
                  <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#D4A24C] opacity-75" />
                </div>
              </div>
            </motion.div>
          )}

          {phase === PHASE.FEEDBACK && tapResult && (
            <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, type: "spring" }}
                className={`rounded-2xl px-6 py-3 text-center text-base font-semibold shadow-sm ${tapResult.isCorrect ? "bg-[#8B9A7A]/20 text-[#8B9A7A]" : "bg-[#C1653A]/12 text-[#C1653A]"}`}>
                {tapResult.isCorrect
                  ? "✓ Well spotted!"
                  : `That's alright — this is what changed: ${scene.missingLabel}`}
              </motion.div>

              <div className="relative w-full overflow-hidden rounded-2xl shadow-md" style={{ maxWidth: 560 }}>
                <SceneHalf src={scene.file} side="original" alt="Answer revealed" inline />
                <AnswerDot x={scene.answerX} y={scene.answerY} isCorrect={tapResult.isCorrect} />
                {!tapResult.isCorrect && (
                  <div className="pointer-events-none absolute" style={{ left: `${tapResult.x}%`, top: `${tapResult.y}%`, transform: "translate(-50%,-50%)" }}>
                    <div className="h-9 w-9 rounded-full border-2 border-white/60 bg-[#2B2420]/25" />
                  </div>
                )}
              </div>

              {adaptiveMessage && (
                <p className="max-w-sm text-center text-sm italic text-[#2B2420]/55">{adaptiveMessage}</p>
              )}

              <button onClick={handleNextRound}
                className="mt-1 rounded-full bg-[#C1653A] px-9 py-3 text-sm font-semibold text-white shadow transition duration-300 hover:bg-[#a8532d] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C1653A]/40">
                {sceneIndex + 1 < SCENES.length ? "Next Scene →" : "Start Again ↺"}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 border-t border-[#2B2420]/8 px-6 py-3">
        <Shield size={13} className="mt-px shrink-0 text-[#2B2420]/30" />
        <p className="text-[11px] leading-snug text-[#2B2420]/40">
          Smriti Sathi supports cognitive engagement — it does not diagnose or treat any medical condition.
        </p>
      </div>
    </div>
  );
}

// ─── SceneHalf ────────────────────────────────────────────────────────────────
// Shows left half (original) or right half (changed) of the side-by-side composite.
function SceneHalf({ src, side, alt, inline }) {
  const img = (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className="h-auto w-[200%] max-w-none select-none block"
      style={{ marginLeft: side === "changed" ? "-100%" : "0%" }}
    />
  );
  if (inline) return img;
  return (
    <div className="w-full overflow-hidden rounded-2xl shadow-md" style={{ maxWidth: 560 }}>
      {img}
    </div>
  );
}

// ─── AnswerDot ────────────────────────────────────────────────────────────────
function AnswerDot({ x, y, isCorrect }) {
  const color = isCorrect ? "#8B9A7A" : "#C1653A";
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="pointer-events-none absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
    >
      <motion.div
        animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="absolute inset-0 h-11 w-11 rounded-full"
        style={{ background: color + "55", margin: "-4px" }}
      />
      <div className="relative h-10 w-10 rounded-full border-[3px] border-white shadow-lg" style={{ background: color }} />
    </motion.div>
  );
}

// ─── PhaseBar ─────────────────────────────────────────────────────────────────
function PhaseBar({ durationMs, color }) {
  return (
    <div className="w-full max-w-[560px] overflow-hidden rounded-full bg-[#2B2420]/8" style={{ height: 4 }}>
      <motion.div
        initial={{ width: "100%" }} animate={{ width: "0%" }}
        transition={{ duration: durationMs / 1000, ease: "linear" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}
