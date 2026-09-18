import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, FileImage, Heart, Play, Sparkles, Upload, WandSparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cognitiveStore } from '../lib/store/cognitiveStore';

const DEMO_CAPSULE = {
  title: 'Sunday in the family garden',
  subject: 'Meera and Papa Ji',
  place: 'the family garden',
  feeling: 'joy and togetherness',
  story: 'A Sunday afternoon surrounded by people and places we love.',
  activityTitle: 'Family Garden Recall',
  image: '/images/garden-gathering.jpg'
};

export default function MemoryStudio({ onOpenPersonalizedGame }) {
  const inputRef = useRef(null);
  const [storeState, setStoreState] = useState(cognitiveStore.getState());
  const [draftImage, setDraftImage] = useState(storeState.memoryCapsule?.image || '');
  const [generated, setGenerated] = useState(Boolean(storeState.memoryCapsule));
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => cognitiveStore.subscribe((state) => setStoreState({ ...state })), []);

  const capsule = storeState.memoryCapsule;
  const image = draftImage || capsule?.image || DEMO_CAPSULE.image;

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraftImage(String(reader.result));
      setGenerated(false);
    };
    reader.readAsDataURL(file);
  };

  const generateCapsule = async () => {
    setIsGenerating(true);
    let aiStory = {};
    if (draftImage?.startsWith('data:image/')) {
      try {
        const response = await fetch('/api/sathi/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: draftImage,
            prompt: 'Describe this family memory warmly in one short sentence. Mention only visible, non-sensitive details. Do not identify people or make medical claims.',
          }),
        });
        if (response.ok) {
          const result = await response.json();
          if (result.text) aiStory = { story: result.text };
        }
      } catch (error) {
        console.warn('Vision memory enrichment unavailable:', error);
      }
    }
    cognitiveStore.saveMemoryCapsule({
        ...DEMO_CAPSULE,
        ...aiStory,
        image,
        title: draftImage ? 'A cherished family moment' : DEMO_CAPSULE.title
      });
      setGenerated(true);
      setIsGenerating(false);
  };

  const openGame = () => {
    if (capsule && onOpenPersonalizedGame) onOpenPersonalizedGame(capsule);
  };

  const timeline = storeState.caregiverUpdates.filter((item) => ['memory', 'care-plan', 'cognitive'].includes(item.category)).slice(0, 4);
  const plan = storeState.carePlan;

  return (
    <div className="mt-12 border-t border-charcoal/10 pt-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-eyebrow text-terracotta font-semibold"><WandSparkles size={14} /> Sathi Memory Studio</div>
          <h3 className="font-serif text-3xl sm:text-4xl text-charcoal mt-2">Turn one family memory into a day of care.</h3>
          <p className="text-sm text-charcoal/65 mt-2 max-w-2xl">Upload a familiar image. Sathi creates a gentle recall activity and keeps the caregiver connected to the moments that matter.</p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-medium text-sage-dark bg-sage-light border border-sage/25 rounded-pill px-3 py-2"><span className="w-2 h-2 rounded-full bg-sage" /> Local-first & private</span>
      </div>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-5">
        <div className="bg-cream rounded-card border border-charcoal/10 p-4 sm:p-5">
          <div className="grid sm:grid-cols-[150px_1fr] gap-5 items-center">
            <button type="button" onClick={() => inputRef.current?.click()} className="relative aspect-square rounded-soft overflow-hidden border-2 border-dashed border-terracotta/35 bg-warm-white group" title="Upload a family memory image">
              <img src={image} alt="Memory capsule preview" className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-charcoal/55 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-warm-white text-xs gap-1"><Upload size={18} /> Change image</span>
            </button>
            <div>
              <p className="text-xs uppercase tracking-wider text-charcoal/50 font-semibold">Step 1 · Add a memory</p>
              <h4 className="font-serif text-xl mt-1">A photo, a voice note, a story</h4>
              <p className="text-sm text-charcoal/65 mt-2">Everything stays in this device for the demo. No diagnosis, no judgment, just a meaningful starting point.</p>
              <input ref={inputRef} type="file" accept="image/*" onChange={handleImage} className="sr-only" />
              <button onClick={() => inputRef.current?.click()} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-terracotta/30 text-terracotta text-sm font-semibold hover:bg-terracotta-light"><Camera size={16} /> Upload family image</button>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-charcoal/60"><FileImage size={15} className="text-terracotta" /> AI-ready memory input</div>
            <button onClick={generateCapsule} disabled={isGenerating} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-pill bg-terracotta text-warm-white text-sm font-semibold hover:bg-terracotta-hover disabled:opacity-60"><Sparkles size={16} /> {isGenerating ? 'Creating capsule...' : 'Generate personal activity'}</button>
          </div>
          {generated && capsule && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-soft bg-warm-white border border-gold/30 flex items-start gap-3"><CheckCircle2 className="text-sage mt-0.5" size={18} /><div><p className="text-sm font-semibold">Memory capsule ready</p><p className="text-xs text-charcoal/65">{capsule.title} · {capsule.activityTitle}</p></div></motion.div>}
          {generated && capsule && <label className="mt-3 flex items-start gap-3 rounded-soft border border-terracotta/15 bg-terracotta-light/30 p-3 text-xs text-charcoal/70"><input type="checkbox" checked={Boolean(storeState.proactiveCheckIns)} onChange={(event) => cognitiveStore.setProactiveCheckIns(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C1653A]" /><span><strong className="text-charcoal">Allow gentle memory check-ins</strong><br />Sathi may occasionally start a short conversation about this family moment when the site is idle. You can switch this off anytime.</span></label>}
        </div>

        <div className="bg-charcoal text-warm-white rounded-card p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border border-gold/25" />
          <div className="relative">
            <div className="flex items-center gap-2 text-gold-light text-xs uppercase tracking-wider font-semibold"><Heart size={14} fill="currentColor" /> Today's care plan</div>
            <h4 className="font-serif text-2xl mt-2">{plan.title}</h4>
            <div className="mt-5 space-y-3">{plan.steps.map((step, index) => <div key={step} className="flex items-center gap-3 text-sm"><span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 && capsule ? 'bg-terracotta text-warm-white' : 'bg-warm-white/10 text-warm-white/65'}`}>{index + 1}</span><span className={index === 0 && capsule ? 'text-warm-white' : 'text-warm-white/65'}>{step}</span></div>)}</div>
            <button onClick={openGame} disabled={!capsule} className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-pill bg-gold text-charcoal font-semibold text-sm hover:bg-gold-light disabled:opacity-40"><Play size={16} fill="currentColor" /> Start today's personal activity</button>
            {!capsule && <p className="text-[11px] text-warm-white/55 text-center mt-2">Generate a memory capsule to unlock the plan.</p>}
          </div>
        </div>
      </div>

      <div className="mt-5 bg-warm-white border border-charcoal/10 rounded-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4"><div><p className="text-xs uppercase tracking-wider text-terracotta font-semibold">Memory timeline</p><h4 className="font-serif text-xl">A clearer picture of everyday engagement</h4></div><span className="text-xs text-charcoal/50">Caregiver view · live</span></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{timeline.map((item) => <div key={item.id} className="p-3 rounded-soft bg-cream border border-charcoal/5"><p className="text-[10px] uppercase tracking-wider text-charcoal/45">{item.time}</p><p className="text-sm font-semibold mt-1 leading-snug">{item.event}</p><p className="text-xs text-sage-dark mt-2">{item.status}</p></div>)}</div>
        {timeline.length === 0 && <p className="text-sm text-charcoal/60">Your first memory activity will appear here.</p>}
      </div>
    </div>
  );
}
