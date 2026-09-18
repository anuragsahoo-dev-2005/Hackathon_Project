import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TEAM_CONFIG } from '../config/team';

function Counter({ target, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Impact() {
  const stats = TEAM_CONFIG.impactStats;

  return (
    <section id="impact" className="py-28 lg:py-36 bg-cream border-t border-charcoal/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block text-xs font-semibold tracking-eyebrow uppercase text-terracotta mb-4"
          >
            VALIDATION & IMPACT
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal leading-tight tracking-tight mb-5"
          >
            Restoring joy, confidence, and community.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-charcoal/70 font-light max-w-2xl mx-auto"
          >
            Engineered for India's 140 million elders ? bringing cognitive vitality into everyday family life with clinically backed simplicity.
          </motion.p>
        </div>

        {/* Two-Column Showcase: Page 2 Image + Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Page 2 Image (Elderly group under string lights at dusk) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-card overflow-hidden shadow-warm-lg border border-charcoal/10 bg-warm-white p-2">
              <img
                src="/images/garden-gathering.jpg"
                alt="Joyful elderly Indian friends gathered together under warm string lights at dusk"
                className="w-full h-auto rounded-soft object-cover object-center max-h-[460px]"
              />
              <div className="p-4 bg-warm-white">
                <p className="text-xs sm:text-sm text-charcoal/80 font-serif italic text-center">
                  "Social engagement and cognitive play create the strongest defense against memory loneliness."
                </p>
              </div>
            </div>
          </motion.div>

          {/* Three Animated Counter Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="lg:col-span-6 flex flex-col gap-6"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-warm-white rounded-card p-6 sm:p-7 border border-charcoal/10 shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-serif text-4xl sm:text-5xl font-bold text-terracotta mb-2 tracking-tight">
                    <Counter target={stat.number} suffix={stat.suffix} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-charcoal mb-1">
                    {stat.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal/65 font-light max-w-md">
                    {stat.caption}
                  </p>
                </div>
              </div>
            ))}

            {/* SIH Hackathon Footnote */}
            <div className="p-3.5 rounded-soft bg-cream-card border border-charcoal/10 text-[11px] text-charcoal/70 text-center">
              {TEAM_CONFIG.statsDisclaimer}
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
