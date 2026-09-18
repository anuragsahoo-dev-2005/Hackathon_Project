import React from 'react';
import { motion } from 'framer-motion';

export default function SathiWaveform({ active = false, color = '#8B9A7A', count = 7 }) {
  const bars = Array.from({ length: count });

  return (
    <div className="flex items-center justify-center gap-1 h-8 px-2">
      {bars.map((_, i) => (
        <motion.span
          key={i}
          animate={
            active
              ? {
                  scaleY: [0.3, 1.2, 0.4, 0.9, 0.3],
                  opacity: [0.6, 1, 0.7, 1, 0.6]
                }
              : { scaleY: 0.2, opacity: 0.3 }
          }
          transition={
            active
              ? {
                  duration: 0.85,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.12
                }
              : { duration: 0.3 }
          }
          style={{
            backgroundColor: color,
            height: '24px',
            width: '3.5px',
            borderRadius: '9999px',
            transformOrigin: 'center'
          }}
        />
      ))}
    </div>
  );
}
