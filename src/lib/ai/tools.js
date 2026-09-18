// Controlled Function & Tool Calling Registry for Sathi AI Companion
// Strict pre-approved functions — no arbitrary execution
import { cognitiveStore } from '../store/cognitiveStore';

export const APPROVED_TOOLS = [
  'startMemoryGame',
  'startAttentionGame',
  'startRoutineRecall',
  'getTodaySchedule',
  'getProgress',
  'getRecentActivity',
  'createReminder',
  'listReminders',
  'changeLanguage',
  'repeatInstruction',
  'pauseGame',
  'resumeGame',
  'openCaregiverDashboard',
  'openProfile',
  'goHome',
];

export class SathiToolDispatcher {
  constructor(appHandlers = {}) {
    this.handlers = appHandlers;
  }

  setHandlers(handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  async execute(toolName, args = {}) {
    if (!APPROVED_TOOLS.includes(toolName)) {
      return { success: false, error: `Tool ${toolName} is not approved.` };
    }

    switch (toolName) {
      case 'startMemoryGame':
      case 'startAttentionGame':
      case 'startRoutineRecall':
        if (this.handlers.openMemoryGame) {
          this.handlers.openMemoryGame();
          return {
            success: true,
            message:
              toolName === 'startMemoryGame'
                ? 'Opened Memory Match activity.'
                : 'Started cognitive session (Memory Garden).',
          };
        }
        return { success: false, error: 'Handler not registered.' };

      case 'getTodaySchedule': {
        const state = cognitiveStore.getState();
        const pendingReminders = state.reminders.filter((r) => r.status === 'pending');
        return {
          success: true,
          data: {
            user: state.user.name,
            pendingCount: pendingReminders.length,
            reminders: pendingReminders,
          },
        };
      }

      case 'getProgress': {
        const state = cognitiveStore.getState();
        return {
          success: true,
          data: {
            points: state.user.cognitivePoints,
            streak: state.user.streakDays,
            level: state.user.currentLevel,
            recentActivitiesCount: state.activities.length,
          },
        };
      }

      case 'getRecentActivity': {
        const state = cognitiveStore.getState();
        return {
          success: true,
          data: state.activities[0] || null,
        };
      }

      case 'createReminder': {
        const { title, time, type } = args;
        const newReminder = cognitiveStore.createReminder(
          title || 'Gentle Reminder',
          time || 'Flexible',
          type || 'general'
        );
        return { success: true, data: newReminder };
      }

      case 'listReminders': {
        const state = cognitiveStore.getState();
        return { success: true, data: state.reminders };
      }

      case 'changeLanguage': {
        const lang = args.language || 'en';
        cognitiveStore.setLanguage(lang);
        if (this.handlers.changeLanguage) {
          this.handlers.changeLanguage(lang);
        }
        return { success: true, language: lang };
      }

      case 'openCaregiverDashboard':
        if (this.handlers.scrollToCaregiver) {
          this.handlers.scrollToCaregiver();
        } else if (typeof window !== 'undefined') {
          document.getElementById('for-caregivers')?.scrollIntoView({ behavior: 'smooth' });
        }
        return { success: true, message: 'Navigated to Caregiver Dashboard.' };

      case 'openProfile':
        if (this.handlers.scrollToSeniors) {
          this.handlers.scrollToSeniors();
        } else if (typeof window !== 'undefined') {
          document.getElementById('for-seniors')?.scrollIntoView({ behavior: 'smooth' });
        }
        return { success: true, message: 'Opened profile / seniors area.' };

      case 'goHome':
        if (this.handlers.scrollToTop) {
          this.handlers.scrollToTop();
        } else if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return { success: true, message: 'Navigated to home.' };

      case 'pauseGame':
        if (this.handlers.pauseGame) this.handlers.pauseGame();
        return { success: true, action: 'pause' };

      case 'resumeGame':
        if (this.handlers.resumeGame) this.handlers.resumeGame();
        return { success: true, action: 'resume' };

      case 'repeatInstruction':
        return { success: true, action: 'repeat' };

      default:
        return { success: false, error: `Tool ${toolName} not approved.` };
    }
  }
}

export const toolDispatcher = new SathiToolDispatcher();
