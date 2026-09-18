import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, ListOrdered, Eye, Search } from "lucide-react";

// Hotspot positions are % of the image (left%, top%)
// Mapped to real elements in the garden photo:
//   Bench  -> Memory Match
//   Path   -> Sequence Recall
//   Left flowers -> Which One Changed
//   Right tree   -> Object Recognition
const SPOTS = [
  {
    id: "match",
    left: "51%",
    top: "52%",
    icon: Brain,
    emoji: "🪑",
    label: "Memory Match",
    desc: "Sit a while and find the matching pairs.",
    color: "#C1653A",
    bg: "rgba(193,101,58,0.15)",
    ring: "rgba(193,101,58,0.5)",
  },
  {
    id: "sequence",
    left: "40%",
    top: "72%",
    icon: ListOrdered,
    emoji: "🌿",
    label: "Sequence Recall",
    desc: "Follow the path — remember each step.",
    color: "#8B9A7A",
    bg: "rgba(139,154,122,0.18)",
    ring: "rgba(139,154,122,0.55)",
  },
  {
    id: "whichchanged",
    left: "15%",
    top: "68%",
    icon: Search,
    emoji: "🌸",
    label: "Which One Changed?",
    desc: "The flowers know a secret. Can you spot it?",
    color: "#D4A24C",
    bg: "rgba(212,162,76,0.18)",
    ring: "rgba(212,162,76,0.55)",
  },
  {
    id: "recognition",
    left: "77%",
    top: "44%",
    icon: Eye,
    emoji: "🌳",
    label: "Object Recognition",
    desc: "Look up into the branches. Find what you know.",
    color: "#6B8C5A",
    bg: "rgba(107,140,90,0.18)",
    ring: "rgba(107,140,90,0.55)",
  },
];

export default function GardenGameChooser({ isOpen, onClose, onChoose }) {
  const [hovered, setHovered] = useState(null);
  const [entered, setEntered] = useState(false);

  // Trigger the entered animation once after open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => setEntered(true), 100);
    } else {
      setEntered(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="garden-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(30,24,18,0.55)", backdropFilter: "blur(2px)" }}
        >
          {/* Garden scene container */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-screen w-screen overflow-hidden"
          >
            {/* Garden background */}
            <img
              src="/images/garden-game-chooser.jpg"
              alt="A peaceful garden with orange flowers and a wooden bench"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Soft vignette — darken edges gently to focus center */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 75% 75% at 50% 60%, transparent 40%, rgba(20,15,8,0.52) 100%)",
              }}
            />

            {/* Top gradient for text legibility */}
            <div
              className="absolute inset-x-0 top-0 h-32 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, rgba(20,15,8,0.65), transparent)" }}
            />

            {/* Bottom gradient */}
            <div
              className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(20,15,8,0.55), transparent)" }}
            />

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : -12 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="absolute top-0 inset-x-0 flex flex-col items-center pt-6 z-10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80 mb-1">
                Smriti Sathi
              </p>
              <h2
                className="font-serif text-2xl sm:text-3xl font-normal text-white text-center drop-shadow-lg"
                style={{ textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}
              >
                Where would you like to begin?
              </h2>
            </motion.div>

            {/* Instruction */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: entered ? 0.75 : 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute bottom-5 inset-x-0 text-center text-xs text-amber-100/70 z-10"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
            >
              Tap any spot in the garden to begin that activity
            </motion.p>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 rounded-full p-2 text-white/70 hover:text-white hover:bg-white/15 transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* ── Garden hotspots ── */}
            {SPOTS.map((spot, i) => (
              <GardenSpot
                key={spot.id}
                spot={spot}
                index={i}
                entered={entered}
                hovered={hovered}
                setHovered={setHovered}
                onChoose={onChoose}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GardenSpot({ spot, index, entered, hovered, setHovered, onChoose }) {
  const isHovered = hovered === spot.id;
  const Icon = spot.icon;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={entered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.3 + index * 0.12 }}
      className="absolute z-10"
      style={{ left: spot.left, top: spot.top, transform: "translate(-50%, -50%)" }}
    >
      {/* Tooltip card — appears above on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.94 }}
            transition={{ duration: 0.22 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-44 rounded-2xl p-3 text-center shadow-xl pointer-events-none"
            style={{
              background: "rgba(251,246,238,0.96)",
              border: `1.5px solid ${spot.color}40`,
              backdropFilter: "blur(8px)",
            }}
          >
            <p className="font-serif text-sm font-bold text-[#2B2420] leading-tight">
              {spot.label}
            </p>
            <p className="mt-1 text-[11px] text-[#2B2420]/65 leading-snug">{spot.desc}</p>
            {/* Arrow */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 rounded-sm"
              style={{ background: "rgba(251,246,238,0.96)", border: `1.5px solid ${spot.color}40` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The glowing orb button */}
      <motion.button
        onMouseEnter={() => setHovered(spot.id)}
        onMouseLeave={() => setHovered(null)}
        onTouchStart={() => setHovered(spot.id)}
        onClick={() => onChoose(spot.id)}
        whileHover={{ scale: 1.18 }}
        whileTap={{ scale: 0.93 }}
        className="relative flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-4"
        style={{
          width: 54,
          height: 54,
          background: spot.bg,
          border: `2px solid ${spot.color}70`,
          backdropFilter: "blur(10px)",
          boxShadow: isHovered
            ? `0 0 0 8px ${spot.ring}, 0 0 28px ${spot.color}55`
            : `0 0 0 4px ${spot.ring}`,
          focusVisibleOutline: spot.ring,
        }}
        aria-label={`Play ${spot.label}`}
      >
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.55, 1], opacity: [0.45, 0, 0.45] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: index * 0.4 }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: spot.color + "40" }}
        />

        {/* Emoji */}
        <span className="text-xl leading-none select-none" role="img" aria-hidden>
          {spot.emoji}
        </span>
      </motion.button>

      {/* Label below orb */}
      <motion.p
        animate={{ opacity: isHovered ? 0 : 0.9 }}
        transition={{ duration: 0.2 }}
        className="mt-1.5 text-center text-[10px] font-semibold text-white/90 pointer-events-none"
        style={{
          textShadow: "0 1px 6px rgba(0,0,0,0.8)",
          whiteSpace: "nowrap",
          maxWidth: 80,
          marginLeft: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {spot.label}
      </motion.p>
    </motion.div>
  );
}
