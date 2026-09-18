import React from 'react';
import { motion } from 'framer-motion';

export default function EmotionalStatement() {
  return (
    <section className="relative py-28 md:py-36 lg:py-44 bg-cream overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
        
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="inline-block text-xs font-semibold tracking-eyebrow uppercase text-terracotta mb-6"
        >
          THE ESSENCE OF CARE
        </motion.div>

        {/* Large Centered Serif Statement */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-charcoal font-normal leading-[1.25] tracking-tight max-w-4xl mx-auto mb-16"
        >
          ?Memory is more than information. <br className="hidden sm:inline" />
          It is <span className="italic font-normal text-terracotta">connection</span>.?
        </motion.h2>

        {/* Page 4 Image in soft-cornered frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="relative rounded-card overflow-hidden shadow-warm-lg border border-charcoal/10 bg-warm-white p-2 sm:p-3">
            <img
              src="/images/hands-photograph.jpg"
              alt="Elderly hand resting gently alongside a child's hand over a cherished family photograph"
              className="w-full h-auto rounded-soft object-cover object-center max-h-[500px]"
            />
            {/* Subtle warm glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent pointer-events-none rounded-soft"></div>
          </div>

          <p className="mt-6 text-sm sm:text-base text-charcoal/70 font-serif italic max-w-xl mx-auto">
            Every story recalled, every photograph shared, nurtures the timeless bond between generations.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
