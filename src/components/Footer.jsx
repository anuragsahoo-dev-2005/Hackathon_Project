import React from 'react';
import { TEAM_CONFIG } from '../config/team';
import { Sparkles, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-charcoal text-warm-white pt-20 pb-12 rounded-t-[32px] md:rounded-t-[48px] overflow-hidden paper-texture">
      {/* Warm Ambient Glow Highlights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start pb-16 border-b border-warm-white/10">
          
          {/* Left Column: Decorative Marigold (Page 5 Image) + Brand mission */}
          <div className="md:col-span-5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Page 5 Image (Single Marigold bloom on dark paper) */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-warm-lg border border-gold/30 flex-shrink-0 bg-charcoal-dark">
              <img
                src="/images/marigold-footer.jpg"
                alt="Single glowing marigold bloom on dark textured paper"
                className="w-full h-full object-cover object-center hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-serif text-2xl font-bold text-warm-white tracking-tight">
                  SmritiSathi
                </span>
                <span className="w-2 h-2 rounded-full bg-gold"></span>
              </div>
              <p className="text-xs sm:text-sm text-warm-white/70 leading-relaxed max-w-sm font-light">
                Empowering India's seniors with dignity, cognitive vitality, and affectionate family connection.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-gold-light bg-warm-white/5 px-2.5 py-1 rounded-pill border border-gold/20">
                <Award size={13} className="text-gold" />
                <span>Smart India Hackathon 2026</span>
              </div>
            </div>
          </div>

          {/* Center Links: Navigation & Features */}
          <div className="md:col-span-4 grid grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-warm-white/90 mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-warm-white/60">
                <li><a href="#hero" className="hover:text-gold transition">Cognitive Games</a></li>
                <li><a href="#for-seniors" className="hover:text-gold transition">Voice Companion</a></li>
                <li><a href="#for-caregivers" className="hover:text-gold transition">Caregiver Sync</a></li>
                <li><a href="#impact" className="hover:text-gold transition">Pilot Results</a></li>
                <li><a href="/scan" className="hover:text-gold transition">Scan on your phone</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-warm-white/90 mb-4">
                Initiative
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-warm-white/60">
                <li><span className="text-warm-white/70">SIH 2026</span></li>
                <li><span className="text-warm-white/70">Elder Inclusivity</span></li>
                <li><span className="text-warm-white/70">Offline Edge AI</span></li>
                <li><span className="text-warm-white/70">Multilingual Core</span></li>
              </ul>
            </div>
          </div>

          {/* Right Column: Hackathon Team Callout */}
          <div className="md:col-span-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-warm-white/90 mb-4">
              Project Presentation
            </h4>
            <p className="text-xs text-warm-white/60 leading-relaxed mb-4">
              Developed as an AI-powered public wellness initiative for national implementation.
            </p>
            <div className="p-3.5 rounded-soft bg-warm-white/5 border border-warm-white/10 text-xs text-warm-white/80 flex items-center justify-between">
              <span>{TEAM_CONFIG.teamName}</span>
              <span className="text-gold">? SIH</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: SIH Attribution, Copyright & Gold Sparkle Accent */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-warm-white/50 text-center sm:text-left">
          
          <div>
            <p className="text-warm-white/80 font-medium mb-1">
              Built with care for India's families. ? {TEAM_CONFIG.teamName}, {TEAM_CONFIG.hackathon}
            </p>
            <p>
              ? {TEAM_CONFIG.copyrightYear} SmritiSathi. All Rights Reserved. {TEAM_CONFIG.location}.
            </p>
          </div>

          {/* Far bottom-right subtle sparkle accent */}
          <div className="flex items-center gap-1.5 text-gold/80 font-mono text-[11px]">
            <Sparkles size={14} className="text-gold animate-spin-slow" />
            <span>SIH 2026 Demo Ready</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
