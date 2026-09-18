import React, { useEffect, useState } from 'react';
import { Activity, Bell, CheckCircle2, Clock3, Heart, MapPin, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react';
import { cognitiveStore } from '../lib/store/cognitiveStore';

function formatDate(value) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function Stat({ label, value, detail, tone = 'terracotta' }) {
  const tones = {
    terracotta: 'bg-terracotta-light text-terracotta',
    gold: 'bg-gold-light text-gold-dark',
    sage: 'bg-sage-light text-sage-dark',
  };
  return (
    <div className="rounded-card border border-charcoal/10 bg-warm-white p-4 shadow-warm-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal/55">{label}</p>
      <p className={`mt-2 font-serif text-3xl font-bold ${tones[tone].split(' ')[1]}`}>{value}</p>
      <p className="mt-1 text-xs text-charcoal/60">{detail}</p>
    </div>
  );
}

export default function CaregiverDashboard({ onClose }) {
  const [state, setState] = useState(cognitiveStore.getState());

  useEffect(() => cognitiveStore.subscribe((nextState) => setState({ ...nextState })), []);

  const { user, activities, reminders, caregiverUpdates, carePlan, memoryCapsule, geofence } = state;
  const pendingReminders = reminders.filter((reminder) => reminder.status === 'pending');
  const latestActivity = activities[0];
  const safetyLabel = !geofence?.home
    ? 'Home boundary not set'
    : geofence.lastCheck?.inside
      ? 'Within safe boundary'
      : geofence.lastAlert
        ? 'Gentle safety check-in sent'
        : 'Awaiting location check';

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-charcoal/70 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-labelledby="caregiver-dashboard-title">
      <div className="mx-auto min-h-full w-full max-w-7xl overflow-hidden rounded-[24px] bg-cream text-charcoal shadow-warm-lg">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-charcoal/10 bg-warm-white/95 px-5 py-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-light text-terracotta"><Heart size={21} fill="currentColor" /></div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">Family care dashboard</p>
              <h1 id="caregiver-dashboard-title" className="font-serif text-2xl font-bold sm:text-3xl">A clear picture of {user.name}'s day</h1>
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-charcoal/15 px-3 py-2 text-sm font-semibold text-charcoal/70 hover:bg-terracotta-light hover:text-terracotta" aria-label="Close family care dashboard"><X size={18} /> Close</button>
        </header>

        <main className="px-5 py-7 sm:px-8 sm:py-9">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm text-charcoal/65">Private local view · updates from Sathi, games, reminders and safety checks</p>
              <p className="mt-1 text-xs text-charcoal/50">Last activity: {latestActivity?.timestamp || 'Not recorded'}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-pill border border-sage/25 bg-sage-light px-3 py-2 text-xs font-semibold text-sage-dark"><span className="h-2 w-2 animate-pulse rounded-full bg-sage" /> Sathi connected</div>
          </div>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Senior wellness summary">
            <Stat label="Cognitive points" value={user.cognitivePoints} detail={`${user.streakDays}-day active streak`} />
            <Stat label="Current level" value={`Level ${user.currentLevel}`} detail="Adjusted gently from activity" tone="gold" />
            <Stat label="Activities logged" value={activities.length} detail="Memory and attention practice" tone="sage" />
            <Stat label="Pending reminders" value={pendingReminders.length} detail="Medication, wellness and care" tone="terracotta" />
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-card border border-charcoal/10 bg-warm-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Activity size={18} className="text-terracotta" /><h2 className="font-serif text-2xl">Cognitive wellness</h2></div><span className="text-xs text-charcoal/50">Not a medical diagnosis</span></div>
              <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-charcoal/10 text-[11px] uppercase tracking-wider text-charcoal/50"><tr><th className="pb-3 pr-3">Activity</th><th className="pb-3 pr-3">Result</th><th className="pb-3 pr-3">Accuracy</th><th className="pb-3">When</th></tr></thead><tbody>{activities.slice(0, 6).map((activity) => <tr key={activity.id} className="border-b border-charcoal/5"><td className="py-3 pr-3 font-semibold">{activity.title}</td><td className="py-3 pr-3 text-charcoal/65">{activity.result}</td><td className="py-3 pr-3 text-terracotta">{activity.accuracy}%</td><td className="py-3 text-charcoal/55">{activity.timestamp}</td></tr>)}</tbody></table></div>
            </div>

            <div className="rounded-card border border-charcoal/10 bg-charcoal p-5 text-warm-white sm:p-6">
              <div className="flex items-center gap-2 text-gold-light"><Clock3 size={17} /><p className="text-xs font-semibold uppercase tracking-wider">Today's care plan</p></div>
              <h2 className="mt-2 font-serif text-2xl">{carePlan.title}</h2>
              <div className="mt-5 space-y-3">{carePlan.steps.map((step, index) => <div key={step} className="flex items-center gap-3 text-sm"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index === 0 && memoryCapsule ? 'bg-terracotta text-warm-white' : 'bg-warm-white/10 text-warm-white/60'}`}>{index + 1}</span><span className={index === 0 && memoryCapsule ? 'text-warm-white' : 'text-warm-white/60'}>{step}</span></div>)}</div>
              <p className="mt-5 text-xs text-warm-white/55">Care plans support routine and connection; they do not replace professional care.</p>
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="rounded-card border border-charcoal/10 bg-warm-white p-5"><div className="flex items-center gap-2"><Bell size={17} className="text-gold-dark" /><h2 className="font-serif text-xl">Reminders</h2></div><div className="mt-4 space-y-3">{reminders.slice(0, 5).map((reminder) => <div key={reminder.id} className="flex items-start justify-between gap-3 rounded-soft bg-cream p-3"><div><p className="text-sm font-semibold">{reminder.title}</p><p className="mt-1 text-xs text-charcoal/55">{reminder.time} · {reminder.source}</p></div><span className={`text-[10px] font-semibold uppercase ${reminder.status === 'completed' ? 'text-sage-dark' : 'text-terracotta'}`}>{reminder.status}</span></div>)}</div></div>
            <div className="rounded-card border border-charcoal/10 bg-warm-white p-5"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-sage-dark" /><h2 className="font-serif text-xl">Safety</h2></div><div className="mt-4 rounded-soft bg-cream p-4"><p className="text-sm font-semibold">{safetyLabel}</p><p className="mt-2 text-xs text-charcoal/60">{geofence?.home ? `Safe radius: ${geofence.radiusMeters} metres` : 'Set a home point in the family safety section.'}</p><p className="mt-2 text-xs text-charcoal/50">Last check: {formatDate(geofence?.lastCheck?.checkedAt)}</p></div><p className="mt-3 text-[11px] text-charcoal/55">Location checks are consent-based and periodic, not continuous tracking.</p></div>
            <div className="rounded-card border border-charcoal/10 bg-warm-white p-5"><div className="flex items-center gap-2"><UserRound size={17} className="text-terracotta" /><h2 className="font-serif text-xl">Memory capsule</h2></div>{memoryCapsule ? <div className="mt-4"><p className="text-sm font-semibold">{memoryCapsule.title}</p><p className="mt-2 text-xs text-charcoal/65">{memoryCapsule.story}</p><p className="mt-3 text-xs text-charcoal/50">{memoryCapsule.subject} · {memoryCapsule.place}</p><span className="mt-4 inline-flex items-center gap-1 rounded-pill bg-sage-light px-3 py-1.5 text-[11px] font-semibold text-sage-dark"><CheckCircle2 size={13} /> Personal activity ready</span></div> : <p className="mt-4 text-sm text-charcoal/60">No family memory capsule has been created yet.</p>}</div>
          </section>

          <section className="mt-5 rounded-card border border-charcoal/10 bg-warm-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Sparkles size={17} className="text-terracotta" /><h2 className="font-serif text-xl">Live family timeline</h2></div><p className="mt-1 text-xs text-charcoal/55">Everyday engagement, care and safety updates</p></div><span className="text-xs text-charcoal/50">{caregiverUpdates.length} updates</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{caregiverUpdates.slice(0, 9).map((update) => <div key={update.id} className="rounded-soft border border-charcoal/5 bg-cream p-3"><p className="text-[10px] uppercase tracking-wider text-charcoal/45">{update.category} · {update.time}</p><p className="mt-1 text-sm font-semibold leading-snug">{update.event}</p><p className="mt-2 text-xs text-sage-dark">{update.status}</p></div>)}</div></section>

          <p className="mt-6 flex items-start gap-2 border-t border-charcoal/10 pt-4 text-[11px] leading-relaxed text-charcoal/55"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-sage-dark" /> Smriti Sathi supports cognitive engagement, daily routines and family connection. It does not diagnose, monitor, or treat dementia or any medical condition.</p>
        </main>
      </div>
    </div>
  );
}
