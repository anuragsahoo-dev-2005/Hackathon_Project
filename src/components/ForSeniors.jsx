import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Mic, Bell, Sparkles, Heart, Volume2, Check } from 'lucide-react';
import { chime } from './AudioChime';

export default function ForSeniors({ onOpenGame, onOpenSequenceGame }) {
  const [playingVoice, setPlayingVoice] = useState(false);
  const [activeLang, setActiveLang] = useState('Hindi');

  const voiceScripts = {
    Hindi: {
      text: "?????? ???? ??! ????? ?? ????? ??? ??? ?? ??? ???? ?? 5 ???? ?? ????? ???? ??? ??????",
      translation: "Namaste Dadi ji! The afternoon sun is shining. Shall we play a 5-minute flower memory game together?"
    },
    English: {
      text: "Good afternoon, Papa! It's 4:30 PM ? time for your warm herbal tea and a lovely family stroll.",
      translation: "Delivered with gentle cadence and affectionate tone."
    },
    Tamil: {
      text: "??????? ??????! ???? ?????? ????? ????????????. ?????? ??????? ????????? ?????????????.",
      translation: "Vanakkam Paatti! Evening tea time has arrived. Remember your gentle medicine."
    }
  };

  const handlePlayVoice = (lang) => {
    setActiveLang(lang);
    setPlayingVoice(true);
    chime.playVoicePreview();
    setTimeout(() => {
      setPlayingVoice(false);
    }, 3500);
  };

  const seniorFeatures = [
    {
      id: 'games',
      icon: (
        <div className="w-14 h-14 rounded-card bg-terracotta-light text-terracotta flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Gamepad2 size={28} />
        </div>
      ),
      title: "Cognitive Games",
      description: "Gentle, personalized memory games that adapt to each person's pace and interests.",
      badge: "Self-Paced & Joyful",
      bullets: [
        "Memory matching with nostalgic regional illustrations",
        "Story recall and proverb completion",
        "Adaptive pace that never pressures"
      ],
      interactiveAction: (
        <div className="mt-4 pt-4 border-t border-charcoal/10">
          <button
            onClick={onOpenGame}
            className="w-full py-2.5 px-4 rounded-pill bg-terracotta hover:bg-terracotta-hover text-warm-white text-xs font-semibold flex items-center justify-center gap-2 shadow-warm-sm transition cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Launch Cognitive Mini-Game</span>
          </button>
          <button
            onClick={onOpenSequenceGame}
            className="mt-2 w-full rounded-pill border border-terracotta/35 bg-warm-white px-4 py-2.5 text-xs font-semibold text-terracotta transition hover:bg-terracotta-light"
          >
            Try Sequence Recall
          </button>
          <p className="mt-2 text-[10px] text-center text-charcoal/60">
            23 familiar objects, fruits, flowers, and household items
          </p>
        </div>
      )
    },
    {
      id: 'voice',
      icon: (
        <div className="w-14 h-14 rounded-card bg-gold-light text-gold-dark flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Mic size={28} />
        </div>
      ),
      title: "Voice Companion",
      description: "A warm voice assistant for reminders, conversation, and daily check-ins, in the language they're most comfortable in.",
      badge: "Multilingual & Natural",
      bullets: [
        "Converses in Hindi, Tamil, Bengali, Marathi, and English",
        "Empathetic listening, not rigid robotic commands",
        "Calibrated speaking pace designed for elders"
      ],
      interactiveAction: (
        <div className="mt-4 pt-4 border-t border-charcoal/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/70">
              Interactive Voice Preview
            </span>
            <div className="flex gap-1">
              {['Hindi', 'English', 'Tamil'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handlePlayVoice(lang)}
                  className={`text-[10px] px-2 py-0.5 rounded-pill font-medium transition ${
                    activeLang === lang
                      ? 'bg-gold text-warm-white'
                      : 'bg-cream text-charcoal/70 hover:bg-gold-light'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-2.5 rounded-soft bg-warm-white border border-gold/20 text-left">
            <p className="text-xs text-charcoal font-serif mb-1 italic">
              "{voiceScripts[activeLang].text}"
            </p>
            <p className="text-[10px] text-charcoal/60">
              {voiceScripts[activeLang].translation}
            </p>
            <button
              onClick={() => handlePlayVoice(activeLang)}
              className="mt-2 w-full py-1.5 px-3 rounded-pill bg-gold/15 hover:bg-gold/25 text-gold-dark text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Volume2 size={13} className={playingVoice ? "animate-pulse text-terracotta" : ""} />
              <span>{playingVoice ? "Playing Warm Voice..." : "Hear Sample Greeting"}</span>
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'reminders',
      icon: (
        <div className="w-14 h-14 rounded-card bg-sage-light text-sage-dark flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Bell size={28} />
        </div>
      ),
      title: "Gentle Reminders",
      description: "Medicine, meals, and appointments ? delivered with patience, never pressure.",
      badge: "Patience-First Design",
      bullets: [
        "Unobtrusive audio chimes and clear high-contrast cards",
        "Repeats softly if elder is busy, never alarms",
        "Family members notified automatically upon completion"
      ],
      interactiveAction: (
        <div className="mt-4 pt-4 border-t border-charcoal/10">
          <div className="p-2.5 rounded-soft bg-warm-white border border-sage/25 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-sage"></span>
              <span className="text-[11px] font-semibold text-charcoal">
                Gentle Medication Cue ? 5:00 PM
              </span>
            </div>
            <p className="text-[11px] text-charcoal/70">
              "Papa, time for blood sugar tablet with your evening tea."
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-sage-dark font-medium">
              <Check size={12} className="text-sage" />
              <span>Acknowledged by Voice Companion</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="for-seniors" className="py-28 lg:py-36 bg-cream border-t border-charcoal/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-terracotta-light text-terracotta text-xs font-semibold tracking-eyebrow uppercase mb-4"
          >
            <Heart size={12} />
            <span>FOR SENIORS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal leading-tight tracking-tight mb-5"
          >
            Care designed with <span className="italic font-normal text-terracotta">dignity</span> for the golden years.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-charcoal/70 font-light max-w-2xl mx-auto"
          >
            Every feature is crafted to feel like an affectionate companion in the home ? intuitive, respectful, and joyful to interact with.
          </motion.p>
        </div>

        {/* 3-Column Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-8">
          {seniorFeatures.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              whileHover={{ y: -6 }}
              className="group bg-cream-card rounded-card p-7 lg:p-8 border border-charcoal/10 shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {item.icon}
                <div className="inline-block px-2.5 py-0.5 rounded-pill bg-charcoal/5 text-charcoal/70 text-[10px] font-semibold tracking-wider uppercase mb-3">
                  {item.badge}
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal mb-3">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-charcoal/75 leading-relaxed mb-6 font-light">
                  {item.description}
                </p>
                <ul className="space-y-2 mb-4">
                  {item.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-charcoal/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 flex-shrink-0"></span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                {item.interactiveAction}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
