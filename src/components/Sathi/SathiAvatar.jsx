import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mic, Sparkles, Heart, HelpCircle } from 'lucide-react';

export default function SathiAvatar({
  state = 'idle',
  size = 'md',
  onClick,
  showLabel = true,
  variant = 'bust',
}) {
  const reduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-40 h-40 sm:w-48 sm:h-48',
    full: 'w-40 h-52 sm:w-48 sm:h-60',
  };

  const stateStyles = {
    idle: { core: '#D4A24C', accent: '#C1653A', halo: '#FBF6EE', duration: 3.8, rotation: 18 },
    listening: { core: '#D4A24C', accent: '#8B9A7A', halo: '#8B9A7A', duration: 2.1, rotation: 9 },
    thinking: { core: '#C1653A', accent: '#D4A24C', halo: '#D4A24C', duration: 2.7, rotation: 7 },
    speaking: { core: '#D4A24C', accent: '#C1653A', halo: '#C1653A', duration: 1.25, rotation: 5 },
    success: { core: '#D4A24C', accent: '#FBF6EE', halo: '#FBF6EE', duration: 1.4, rotation: 10 },
    support: { core: '#C1653A', accent: '#D4A24C', halo: '#FBF6EE', duration: 5.2, rotation: 24 },
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

  const boxClass = sizeClasses[size];
  const shapeClass = 'rounded-full';
  const style = stateStyles[state] || stateStyles.idle;

  const orbAnim = reduceMotion
    ? {}
    : state === 'idle'
      ? { y: [0, -5, 0], scale: [1, 1.035, 1] }
      : state === 'speaking'
        ? { y: [0, -2, 0], scale: [1, 1.07, 1] }
        : state === 'listening'
          ? { scale: [1, 1.045, 1] }
          : state === 'thinking'
            ? { rotate: [0, 2, -2, 0], scale: [1, 1.04, 1] }
            : state === 'success'
              ? { scale: [1, 1.12, 1] }
              : state === 'support'
                ? { y: [0, -2, 0], scale: [1, 1.02, 1] }
                : {};

  return (
    <div
      className="relative inline-flex flex-col items-center select-none"
      onClick={onClick}
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
      {!reduceMotion && (state === 'listening' || state === 'speaking') && (
        <motion.div
          animate={{ scale: [1, 1.45, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: style.duration, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-[-10%] rounded-full border border-gold/50 bg-gold/10 pointer-events-none"
        />
      )}
      {!reduceMotion && (state === 'idle' || state === 'support') && (
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[-7%] rounded-full bg-terracotta/15 pointer-events-none"
        />
      )}

      <motion.div
        animate={orbAnim}
        transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative ${boxClass} ${shapeClass} overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-500`}
        style={{
          background: `radial-gradient(circle, ${style.core}20 0%, ${style.accent}08 36%, transparent 70%)`,
          boxShadow: `0 0 0 8px ${style.halo}18, 0 0 34px ${style.core}80, inset 0 0 18px ${style.accent}35`,
        }}
      >
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? undefined : { rotate: [0, 360] }}
          transition={{ duration: style.rotation, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[4%] rounded-full opacity-90"
          style={{
            background: `conic-gradient(from 8deg, transparent 0deg 22deg, ${style.accent} 22deg 55deg, transparent 55deg 92deg, ${style.core} 92deg 124deg, transparent 124deg 180deg, ${style.accent} 180deg 215deg, transparent 215deg 275deg, ${style.core} 275deg 305deg, transparent 305deg 360deg)`,
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))',
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? undefined : { rotate: [360, 0] }}
          transition={{ duration: style.rotation * 1.7, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[14%] rounded-full border border-gold/50 border-dotted"
          style={{ boxShadow: `0 0 8px ${style.core}70` }}
        />
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? undefined : { scale: [0.88, 1.06, 0.92, 1], opacity: [0.7, 1, 0.78, 0.9] }}
          transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 h-[30%] w-[30%] rounded-full border-2 border-warm-white/80"
          style={{
            background: `radial-gradient(circle at 38% 32%, #FFFDF9 0%, #FFFDF9 14%, ${style.core} 42%, ${style.accent} 76%, transparent 100%)`,
            boxShadow: `0 0 5px #FFFDF9, 0 0 14px ${style.core}, 0 0 30px ${style.core}CC`,
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? undefined : { opacity: [0.15, 0.65, 0.18], scale: [0.8, 1.18, 0.85] }}
          transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[25%] rounded-full border border-warm-white/50"
        />
        <span className="sr-only">Sathi, your warm AI cognitive companion</span>
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
