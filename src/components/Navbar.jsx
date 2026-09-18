import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Heart } from 'lucide-react';

export default function Navbar({ onOpenGame }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isElderMode, setIsElderMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleElderMode = () => {
    setIsElderMode(!isElderMode);
    document.documentElement.classList.toggle('text-lg', !isElderMode);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-warm-white/90 backdrop-blur-md shadow-warm-sm border-b border-charcoal/10 py-3.5'
          : 'bg-warm-white/60 backdrop-blur-sm border-b border-charcoal/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* Logo left */}
        <a href="#hero" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-terracotta to-gold flex items-center justify-center text-warm-white shadow-warm-sm group-hover:scale-105 transition-transform">
            <Heart size={16} fill="#FFFDF9" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-2xl font-bold tracking-tight text-charcoal">
              SmritiSathi
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta"></span>
            </span>
          </div>
        </a>

        {/* Center Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-charcoal/80">
          <a href="#hero" className="hover:text-terracotta transition-colors">
            Home
          </a>
          <a href="#for-seniors" className="hover:text-terracotta transition-colors">
            For Seniors
          </a>
          <a href="#for-caregivers" className="hover:text-terracotta transition-colors">
            For Caregivers
          </a>
          <a href="#impact" className="hover:text-terracotta transition-colors">
            Impact
          </a>
        </nav>

        {/* Right CTA + Accessibility (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Elder Mode text zoom accessibility button */}
          <button
            onClick={toggleElderMode}
            title="Toggle Senior Friendly Font Size"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-pill border border-charcoal/20 text-charcoal/70 hover:text-charcoal hover:border-charcoal/40 transition"
          >
            <span>{isElderMode ? 'A Regular' : 'A+ Large'}</span>
          </button>

          <button
            onClick={onOpenGame}
            className="flex items-center gap-2 px-5 py-2.5 rounded-pill bg-terracotta hover:bg-terracotta-hover text-warm-white text-sm font-medium shadow-warm-sm transition-all duration-200 hover:shadow-glow-terracotta hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Start Journey</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-charcoal/80 hover:text-charcoal"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-warm-white/95 backdrop-blur-xl border-b border-charcoal/10 px-6 py-5 flex flex-col gap-4 shadow-warm-lg">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-charcoal/90 hover:text-terracotta"
          >
            Home
          </a>
          <a
            href="#for-seniors"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-charcoal/90 hover:text-terracotta"
          >
            For Seniors
          </a>
          <a
            href="#for-caregivers"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-charcoal/90 hover:text-terracotta"
          >
            For Caregivers
          </a>
          <a
            href="#impact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-charcoal/90 hover:text-terracotta"
          >
            Impact
          </a>

          <div className="pt-3 border-t border-charcoal/10 flex flex-col gap-2">
            <button
              onClick={() => {
                toggleElderMode();
                setMobileMenuOpen(false);
              }}
              className="text-center py-2 text-xs font-semibold rounded-pill border border-charcoal/20 text-charcoal/80"
            >
              Toggle Text Size ({isElderMode ? 'Regular' : 'Large A+'})
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGame();
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-pill bg-terracotta text-warm-white text-sm font-medium text-center shadow-warm-sm"
            >
              <span>Start Journey</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
