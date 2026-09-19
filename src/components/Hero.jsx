import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, HeartHandshake, Globe, WifiOff, Play } from 'lucide-react';

export default function Hero({ onOpenGame }) {
  return (
    <section id="hero" className="relative min-h-[92vh] lg:min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-couple.jpg"
          alt="Dignified elderly Indian woman in sunlit botanical garden with glowing memory cards"
          className="w-full h-full object-cover object-center"
        />
        {/* Cinematic dark & warm gradient overlays for effortless text legibility while letting the grandmother and glowing cards shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/80 via-40% to-charcoal/20 lg:to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-charcoal/30 lg:hidden"></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full py-12 lg:py-20">
        <div className="max-w-2xl lg:max-w-3xl">
          
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-warm-white"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-warm-white/10 backdrop-blur-md border border-warm-white/20 text-gold-light text-xs font-semibold tracking-eyebrow uppercase mb-6 shadow-warm-sm">
              <Sparkles size={13} className="text-gold" />
              <span>AI-POWERED COGNITIVE WELLNESS</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.12] tracking-tight mb-6 text-warm-white">
              Keep <span className="italic font-normal text-gold-light underline decoration-terracotta/60 decoration-wavy decoration-1 underline-offset-8">Memories</span> Alive.
            </h1>

            {/* Subhead */}
            <p className="text-lg sm:text-xl text-warm-white/90 leading-relaxed font-sans max-w-2xl mb-9 font-light">
              Personalized cognitive care that helps seniors stay active, connected and supported ? one meaningful moment at a time.
            </p>

            {/* Two Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <button
                onClick={onOpenGame}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-pill bg-terracotta hover:bg-terracotta-hover text-warm-white font-medium text-base shadow-warm-lg hover:shadow-glow-terracotta transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
              >
                <span>Start Your Memory Journey</span>
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-pill bg-warm-white/10 hover:bg-warm-white/20 backdrop-blur-md border border-warm-white/30 text-warm-white font-medium text-base transition-all duration-200"
              >
                <Play size={14} className="text-gold fill-gold" />
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Trust row */}
            <div className="pt-6 border-t border-warm-white/15 max-w-xl">
              <div className="flex flex-wrap items-center gap-y-2.5 gap-x-4 sm:gap-x-6 text-xs sm:text-sm text-warm-white/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-gold" />
                  AI-Assisted
                </span>
                <span className="text-warm-white/30">?</span>
                <span className="flex items-center gap-1.5">
                  <HeartHandshake size={14} className="text-terracotta-light" />
                  Elder-Friendly
                </span>
                <span className="text-warm-white/30">?</span>
                <span className="flex items-center gap-1.5">
                  <Globe size={14} className="text-sage-light" />
                  Multilingual
                </span>
                <span className="text-warm-white/30">?</span>
                <span className="flex items-center gap-1.5">
                  <WifiOff size={14} className="text-warm-white/70" />
                  Offline-Ready
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
