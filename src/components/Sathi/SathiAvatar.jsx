import React from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Mic, Sparkles, Heart, HelpCircle } from 'lucide-react';

/** Locked character asset — do not replace or redesign. */
export const SATHI_CHARACTER_SRC = '/images/sathi/sathi-character.png';

export default function SathiAvatar({
  state = 'idle',
  size = 'md',
  onClick,
  showLabel = true,
  variant = 'bust', // 'bust' | 'full'
}) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 180, damping: 24, mass: 0.4 });
  const springY = useSpring(pointerY, { stiffness: 180, damping: 24, mass: 0.4 });
  const tiltX = useTransform(springY, [-1, 1], [4, -4]);
  const tiltY = useTransform(springX, [-1, 1], [-4, 4]);

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-40 h-40 sm:w-48 sm:h-48',
    full: 'w-40 h-52 sm:w-48 sm:h-60',
  };

  const ringStyles = {
    idle: 'border-terracotta/30 shadow-warm-sm',
    listening: 'border-sage ring-4 ring-sage/40 shadow-glow-gold',
    thinking: 'border-gold ring-4 ring-gold/40',
    speaking: 'border-terracotta ring-4 ring-terracotta/40 shadow-glow-terracotta',
    success: 'border-gold ring-4 ring-gold/60 shadow-glow-gold',
    support: 'border-sage ring-4 ring-sage/30',
  };

  const stateBadges = {
    idle: null,
    listening: {
      text: 'Listening...',
      bg: 'bg-sage text-warm-white',
      icon: <Mic size={12} className={reduceMotion ? '' : 'animate-pulse'} />,
    },
    thinking: {
      text: 'Let me check...',
      bg: 'bg-gold text-warm-white',
      icon: <Sparkles size={12} />,
    },
    speaking: {
      text: 'Speaking...',
      bg: 'bg-terracotta text-warm-white',
      icon: <Sparkles size={12} />,
    },
    success: {
      text: 'Well done!',
      bg: 'bg-gold-dark text-warm-white',
      icon: <Heart size={12} fill="#FFFDF9" />,
    },
    support: {
      text: 'Take your time',
      bg: 'bg-sage-dark text-warm-white',
      icon: <HelpCircle size={12} />,
    },
  };

  const isFull = variant === 'full';
  const boxClass = isFull ? sizeClasses.full : sizeClasses[size];
  const shapeClass = isFull ? 'rounded-[28px]' : 'rounded-full';

  // Face framing for full-body art: zoom into head/shoulders so glasses + face fill the circle
  const faceCropStyle =
    size === 'lg'
      ? { width: '245%', top: '2%', left: '50%', transform: 'translateX(-50%)' }
      : size === 'md'
        ? { width: '255%', top: '0%', left: '50%', transform: 'translateX(-50%)' }
        : { width: '260%', top: '-2%', left: '50%', transform: 'translateX(-50%)' };

  const idleAnim = reduceMotion
    ? {}
    : state === 'idle'
      ? { y: [0, -8, 0], scale: [1, 1.025, 1] }
      : state === 'speaking'
        ? { y: [0, -2, 0], scale: [1, 1.02, 1] }
        : state === 'listening'
          ? { scale: [1, 1.03, 1] }
          : state === 'thinking'
            ? { rotate: [0, 1.5, -1.5, 0] }
            : state === 'success'
              ? { scale: [1, 1.04, 1] }
              : state === 'support'
                ? { y: [0, -2, 0] }
                : {};

  const handlePointerMove = (event) => {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1);
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div
      className="relative inline-flex flex-col items-center select-none"
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick(e);
            }
          : undefined
      }
    >
      {!reduceMotion && state === 'listening' && (
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          className={`absolute inset-0 ${shapeClass} bg-sage/25 pointer-events-none`}
        />
      )}

      {!reduceMotion && state === 'speaking' && (
        <motion.div
          animate={{ scale: [1, 1.22, 1], opacity: [0.45, 0.1, 0.45] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute inset-0 ${shapeClass} bg-terracotta/20 pointer-events-none`}
        />
      )}

      {!reduceMotion && state === 'idle' && (
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.16, 0.3, 0.16] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute inset-0 ${shapeClass} bg-terracotta/15 pointer-events-none`}
        />
      )}

      <motion.div
        animate={idleAnim}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={reduceMotion ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 800 }}
        className={`relative ${boxClass} ${shapeClass} overflow-hidden border-2 bg-gradient-to-b from-cream via-warm-white to-cream-card flex items-center justify-center cursor-pointer transition-all duration-300 ${ringStyles[state] || ringStyles.idle}`}
      >
        {isFull ? (
          <img
            src={SATHI_CHARACTER_SRC}
            alt="Sathi — warm AI cognitive companion"
            className="w-full h-full object-contain object-bottom p-1 pointer-events-none"
            draggable={false}
          />
        ) : (
          <img
            src={SATHI_CHARACTER_SRC}
            alt="Sathi — warm AI cognitive companion"
            className="absolute max-w-none h-auto pointer-events-none select-none"
            style={faceCropStyle}
            draggable={false}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/10 via-transparent to-warm-white/5 pointer-events-none" />
      </motion.div>

      {showLabel && stateBadges[state] && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 4, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`absolute -bottom-2.5 px-2.5 py-0.5 rounded-pill text-[10px] font-medium tracking-wide flex items-center gap-1 shadow-warm-sm z-10 ${stateBadges[state].bg}`}
        >
          {stateBadges[state].icon}
          <span>{stateBadges[state].text}</span>
        </motion.div>
      )}
    </div>
  );
}
