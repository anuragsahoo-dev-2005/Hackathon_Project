// Reactive & Persistent Cognitive Store for Smriti Sathi
// Backed by localStorage for 100% offline support

const STORAGE_KEY = 'smriti_sathi_store_v1';

const DEFAULT_STATE = {
  user: {
    name: 'Papa Ji',
    preferredLanguage: 'en', // 'en' | 'hi'
    streakDays: 4,
    cognitivePoints: 380,
    currentLevel: 2
  },
  memoryCapsule: null,
  carePlan: {
    title: 'A gentle memory moment',
    steps: ['Personal memory activity', 'Evening medicine with tea', 'Family connection'],
    status: 'ready'
  },
  reminders: [
    {
      id: 'rem-1',
      title: 'Morning herbal tea & garden stroll',
      time: '07:30 AM',
      category: 'wellness',
      status: 'completed',
      source: 'Routine'
    },
    {
      id: 'rem-2',
      title: 'Blood pressure & heart medicine with evening tea',
      time: '05:00 PM',
      category: 'medication',
      status: 'pending',
      source: 'Doctor Prescribed'
    },
    {
      id: 'rem-3',
      title: 'Memory Match floral recall session',
      time: '06:30 PM',
      category: 'cognitive',
      status: 'pending',
      source: 'Sathi AI Companion'
    }
  ],
  activities: [
    {
      id: 'act-1',
      title: 'Botanical Memory Recall',
      result: 'Completed 8 pairs in 46s',
      accuracy: 90,
      mistakes: 1,
      duration: '46s',
      timestamp: 'Today, 11:15 AM',
      level: 2
    }
  ],
  caregiverUpdates: [
    {
      id: 'cg-1',
      time: 'Just now',
      event: 'Heart medicine scheduled for 5:00 PM with tea',
      status: 'Synced with Sathi Companion',
      category: 'medication'
    },
    {
      id: 'cg-2',
      time: '3:30 PM',
      event: 'Completed botanical memory activity (Level 2)',
      status: 'High engagement (+150 pts logged)',
      category: 'cognitive'
    },
    {
      id: 'cg-3',
      time: '7:45 AM',
      event: 'Morning walk logged in garden',
      status: '2,400 steps completed',
      category: 'wellness'
    }
  ]
};

class CognitiveStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
    return DEFAULT_STATE;
  }

  saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not write to localStorage:', e);
    }
    this.notify();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // --- Actions ---

  setLanguage(lang) {
    this.state.user.preferredLanguage = lang;
    this.saveState();
  }

  setLevel(level) {
    this.state.user.currentLevel = Math.min(3, Math.max(1, Number(level) || 1));
    this.saveState();
  }

  createReminder(title, time, category = 'general') {
    const newRem = {
      id: 'rem-' + Date.now(),
      title,
      time: time || 'Flexible',
      category,
      status: 'pending',
      source: 'Created via Sathi Voice'
    };
    this.state.reminders = [newRem, ...this.state.reminders];

    // Log update for caregiver
    const cgUpdate = {
      id: 'cg-' + Date.now(),
      time: 'Just now',
      event: `New reminder set: ${title} (${time})`,
      status: 'Logged by Sathi Companion',
      category
    };
    this.state.caregiverUpdates = [cgUpdate, ...this.state.caregiverUpdates];

    this.saveState();
    return newRem;
  }

  saveMemoryCapsule(capsule) {
    this.state.memoryCapsule = {
      ...capsule,
      createdAt: capsule.createdAt || new Date().toISOString()
    };
    this.state.carePlan = {
      title: `A memory moment with ${capsule.subject || 'someone special'}`,
      steps: [capsule.activityTitle || 'Personal memory activity', 'Evening medicine with tea', 'Family connection'],
      status: 'ready'
    };
    this.state.caregiverUpdates = [
      {
        id: 'cg-' + Date.now(),
        time: 'Just now',
        event: `Created a personal memory capsule: ${capsule.title}`,
        status: 'Sathi generated a gentle activity for Papa Ji',
        category: 'memory'
      },
      ...this.state.caregiverUpdates
    ];
    this.saveState();
    return this.state.memoryCapsule;
  }

  completeCarePlanStep(step) {
    this.state.caregiverUpdates = [
      {
        id: 'cg-' + Date.now(),
        time: 'Just now',
        event: `Today's care plan: ${step}`,
        status: 'Completed with Sathi Companion',
        category: 'care-plan'
      },
      ...this.state.caregiverUpdates
    ];
    this.saveState();
  }

  listReminders() {
    return this.state.reminders;
  }

  recordActivity(activityData) {
    const newAct = {
      id: 'act-' + Date.now(),
      title: activityData.title || 'Cognitive Memory Game',
      result: activityData.result || 'Completed',
      accuracy: activityData.accuracy || 100,
      mistakes: activityData.mistakes || 0,
      duration: activityData.duration || '30s',
      timestamp: 'Just now',
      level: activityData.level || 2
    };
    this.state.activities = [newAct, ...this.state.activities];
    this.state.user.cognitivePoints += 50;

    // Add caregiver event
    const cgUpdate = {
      id: 'cg-' + Date.now(),
      time: 'Just now',
      event: `Completed ${newAct.title}: ${newAct.result}`,
      status: `Accuracy ${newAct.accuracy}% · Cognitive points: ${this.state.user.cognitivePoints}`,
      category: 'cognitive'
    };
    this.state.caregiverUpdates = [cgUpdate, ...this.state.caregiverUpdates];

    this.saveState();
    return newAct;
  }

  getCaregiverUpdates() {
    return this.state.caregiverUpdates;
  }
}

export const cognitiveStore = new CognitiveStore();
