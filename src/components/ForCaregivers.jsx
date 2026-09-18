import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Smartphone, CheckCircle2, Sparkles } from 'lucide-react';
import { cognitiveStore } from '../lib/store/cognitiveStore';
import MemoryStudio from './MemoryStudio';

export default function ForCaregivers({ onOpenPersonalizedGame }) {
  const [activeTab, setActiveTab] = useState('meds');
  const [storeState, setStoreState] = useState(cognitiveStore.getState());

  useEffect(() => {
    const unsub = cognitiveStore.subscribe((newState) => {
      setStoreState({ ...newState });
    });
    return unsub;
  }, []);

  // Filter real updates from cognitiveStore
  const medUpdates = storeState.caregiverUpdates.filter(u => u.category === 'medication' || u.category === 'hydration');
  const cogUpdates = storeState.caregiverUpdates.filter(u => u.category === 'cognitive');
  const wellUpdates = storeState.caregiverUpdates.filter(u => u.category === 'wellness' || u.category === 'general');

  const tabs = [
    {
      id: 'meds',
      title: 'Medication',
      current: medUpdates[0] || {
        time: '5:00 PM',
        event: 'Heart medicine scheduled with evening tea',
        status: 'Synced with Sathi Companion'
      }
    },
    {
      id: 'games',
      title: 'Brain Wellness',
      current: cogUpdates[0] || {
        time: '3:30 PM',
        event: 'Completed 6-card flower recall test',
        status: 'Score: High engagement (+150 pts)'
      }
    },
    {
      id: 'wellness',
      title: 'Daily Rhythm',
      current: wellUpdates[0] || {
        time: '7:45 AM',
        event: 'Morning garden stroll logged',
        status: '2,400 steps ? Hydration reminded'
      }
    }
  ];

  const latestEvent = storeState.caregiverUpdates[0] || {
    event: "Papa confirmed: Heart medication taken with warm ginger tea.",
    status: "Logged automatically ? No frantic phone calls needed",
    time: "Just now"
  };

  return (
    <section id="for-caregivers" className="py-28 lg:py-36 bg-warm-white border-t border-charcoal/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Page 3 Image (Daughter & Father + glowing reminder) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-card overflow-hidden shadow-warm-lg border border-charcoal/10 bg-cream">
              <img
                src="/images/caregiver-reminder.jpg"
                alt="Affectionate daughter with elderly father holding a gentle translucent glowing reminder screen"
                className="w-full h-auto object-cover object-center max-h-[520px]"
              />
              
              {/* Floating Live Status Card Overlay backed by cognitiveStore */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-warm-white/95 backdrop-blur-md rounded-card p-4 shadow-warm-md border border-terracotta/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sage animate-pulse"></span>
                    <span className="text-xs font-semibold text-charcoal">
                      Caregiver Live Feed
                    </span>
                  </div>
                  <span className="text-[11px] text-charcoal/50">{latestEvent.time || 'Live'}</span>
                </div>
                
                <p className="text-xs sm:text-sm text-charcoal/90 font-medium mb-1">
                  {latestEvent.event}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-sage-dark font-medium">
                  <CheckCircle2 size={13} className="text-sage" />
                  <span>{latestEvent.status}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Narrative & 3 Bullets */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            {/* Eyebrow */}
            <div className="inline-block text-xs font-semibold tracking-eyebrow uppercase text-terracotta mb-4">
              FOR CAREGIVERS
            </div>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal leading-tight tracking-tight mb-6">
              Peace of mind, <br />
              <span className="italic font-normal text-terracotta">from anywhere</span>.
            </h2>

            {/* Paragraph */}
            <p className="text-base sm:text-lg text-charcoal/75 leading-relaxed font-light mb-8">
              Whether you are across the city, at the office, or living overseas, SmritiSathi keeps you seamlessly attuned to your loved ones' daily wellbeing ? protecting their independence while keeping your family safely anchored.
            </p>

            {/* 3 Bullet Benefits */}
            <div className="space-y-5 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-terracotta-light text-terracotta flex items-center justify-center flex-shrink-0 mt-0.5 shadow-warm-sm">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-charcoal mb-0.5">
                    Real-time updates on your loved one's wellbeing
                  </h4>
                  <p className="text-sm text-charcoal/70 font-light">
                    Glance at your phone to see activity milestones, conversation engagement, and gentle daily check-ins.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-gold-light text-gold-dark flex items-center justify-center flex-shrink-0 mt-0.5 shadow-warm-sm">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-charcoal mb-0.5">
                    Shared reminders and care schedules
                  </h4>
                  <p className="text-sm text-charcoal/70 font-light">
                    Coordinate medications, doctor visits, and dietary cues across family members with synced schedules.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-sage-light text-sage-dark flex items-center justify-center flex-shrink-0 mt-0.5 shadow-warm-sm">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-charcoal mb-0.5">
                    Gentle alerts, never alarming ones
                  </h4>
                  <p className="text-sm text-charcoal/70 font-light">
                    Respectful notifications that prompt subtle care without triggering undue anxiety or panic.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Caregiver Dashboard Preview Pill */}
            <div className="p-4 rounded-card bg-cream border border-charcoal/10">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-charcoal/70 uppercase tracking-wider block">
                  Live Caregiver Sync (Real-time):
                </span>
                <span className="text-[10px] text-terracotta font-medium flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>Sathi Connected</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-xs px-3 py-1.5 rounded-pill font-medium transition cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-terracotta text-warm-white shadow-warm-sm'
                        : 'bg-warm-white text-charcoal/70 hover:bg-cream-dark'
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </div>

              {/* Active Tab Preview */}
              {(() => {
                const current = tabs.find((t) => t.id === activeTab);
                const info = current?.current || {};
                return (
                  <div className="bg-warm-white p-3 rounded-soft border border-charcoal/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-charcoal">{info.event}</span>
                        <span className="text-[10px] text-terracotta font-medium">({info.time})</span>
                      </div>
                      <span className="text-[11px] text-charcoal/60">{info.status}</span>
                    </div>
                    <CheckCircle2 size={16} className="text-sage" />
                  </div>
                );
              })()}
            </div>

          </motion.div>

        </div>

        <MemoryStudio onOpenPersonalizedGame={onOpenPersonalizedGame} />

      </div>
    </section>
  );
}
