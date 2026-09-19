import React from 'react';
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, Gamepad2, HeartHandshake, LockKeyhole, Mic, QrCode, Sparkles, UsersRound, Volume2 } from 'lucide-react';
import SathiCompanion from './Sathi/SathiCompanion';

const steps = [
  {
    icon: Mic,
    title: 'Speak naturally',
    text: 'Tap Sathi and say what you need in everyday language. Sathi can respond by voice and text, remember the conversation, and ask a gentle follow-up.',
    example: '“I feel a little tired today.”',
  },
  {
    icon: Sparkles,
    title: 'Sathi understands intent',
    text: 'The companion recognizes requests about activities, reminders, progress, family care, language, the QR page, and movement around the site.',
    example: '“Show me the activity choices.”',
  },
  {
    icon: CheckCircle2,
    title: 'The site responds',
    text: 'Sathi opens the right screen or completes the approved action, then tells you what happened so the experience stays clear and calm.',
    example: '“Open my caregiver dashboard.”',
  },
];

const features = [
  [Gamepad2, 'Cognitive games', 'Memory Match, Sequence Recall, Object Recognition, and Which One Changed adapt gently to the user’s pace.'],
  [HeartHandshake, 'Caregiver connection', 'Family members can view progress, reminders, memory capsules, safety updates, and the everyday timeline.'],
  [Brain, 'Personal memory studio', 'A family image can become a private, personalized recall activity stored on the device for the demo.'],
  [Volume2, 'Voice and language', 'Use the microphone, typing, repeat controls, continuous listening, and language selection where browser support is available.'],
  [QrCode, 'Phone access', 'Open the QR page from the navigation and scan it to take the live site to another phone.'],
  [LockKeyhole, 'Account sync', 'Supabase sign-in connects a user account across devices while keeping authentication separate from the AI experience.'],
];

const commands = [
  '“Start my memory game.”',
  '“Remind me to drink water at 11.”',
  '“Show my progress.”',
  '“Open the caregiver dashboard.”',
  '“Take me to the QR page.”',
  '“Pause the game.”',
];

export default function HowItWorksPage() {
  return (
    <>
      <main className="min-h-screen overflow-hidden bg-cream text-charcoal">
      <section className="relative bg-charcoal px-5 pb-20 pt-6 text-warm-white sm:px-8 sm:pb-28 sm:pt-8">
        <div className="mx-auto max-w-7xl">
          <a href="/" className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-warm-white/25 px-5 py-3 text-sm font-semibold text-warm-white transition hover:border-gold hover:text-gold-light">
            <ArrowLeft size={17} /> Back to Smriti Sathi
          </a>
          <div className="mt-20 max-w-4xl sm:mt-28">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-light">A companion that helps you act</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] sm:text-7xl">Your voice can guide the whole Smriti Sathi experience.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-warm-white/75 sm:text-xl">Talk naturally with Sathi. It can answer, listen, open activities, create gentle reminders, show progress, connect family care, and guide you through the site.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/#for-seniors" className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-terracotta px-5 py-3 text-sm font-semibold text-warm-white transition hover:bg-terracotta-hover">Try the experience <ArrowRight size={17} /></a>
              <a href="/scan" className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-warm-white/25 px-5 py-3 text-sm font-semibold text-warm-white transition hover:border-gold hover:text-gold-light"><QrCode size={17} /> Open QR page</a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-charcoal/10 bg-warm-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-terracotta">Voice-first flow</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">From a sentence to a helpful action.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-card border border-charcoal/10 bg-cream p-6 shadow-warm-sm sm:p-7">
                  <div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-light text-terracotta"><Icon size={23} /></div><span className="font-serif text-4xl text-gold/70">0{index + 1}</span></div>
                  <h3 className="mt-7 font-serif text-2xl">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{step.text}</p>
                  <p className="mt-5 rounded-soft border border-gold/25 bg-warm-white px-4 py-3 font-serif text-sm italic text-charcoal/80">{step.example}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-cream px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-8">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-terracotta">What is automated</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">One calm place for everyday care.</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-charcoal/70">Sathi is connected to the app’s approved actions, so spoken requests can move through the same journeys as buttons and touch controls.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(([Icon, title, text]) => <article key={title} className="rounded-card border border-charcoal/10 bg-warm-white p-5 shadow-warm-sm"><Icon size={22} className="text-terracotta" /><h3 className="mt-5 font-serif text-xl">{title}</h3><p className="mt-2 text-sm leading-relaxed text-charcoal/65">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-charcoal px-5 py-16 text-warm-white sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div><p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-light">Try these phrases</p><h2 className="mt-3 font-serif text-4xl sm:text-5xl">You can simply say what you need.</h2></div>
          <div className="grid gap-3 sm:grid-cols-2">{commands.map((command) => <div key={command} className="flex min-h-14 items-center rounded-soft border border-warm-white/15 bg-warm-white/5 px-5 font-serif text-base text-warm-white/90">{command}</div>)}</div>
        </div>
      </section>

      <footer className="bg-cream px-5 py-8 text-center text-sm text-charcoal/60 sm:px-8"><a href="/" className="font-semibold text-terracotta hover:underline">Return to Smriti Sathi</a></footer>
      </main>
      <SathiCompanion
        onCloseAllViews={() => window.location.assign('/')}
        onOpenGame={() => window.location.assign('/#for-seniors')}
        onOpenGameChooser={() => window.location.assign('/#for-seniors')}
        onOpenDashboard={() => window.location.assign('/#for-caregivers')}
        onOpenSequenceGame={() => window.location.assign('/#for-seniors')}
        onOpenRecognitionGame={() => window.location.assign('/#for-seniors')}
        onOpenWhichChangedGame={() => window.location.assign('/#for-seniors')}
        isGameOpen={false}
      />
    </>
  );
}
