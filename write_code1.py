import os

files = {}

# 1. vite.config.js
files["vite.config.js"] = """import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  }
});
"""

# 2. postcss.config.js
files["postcss.config.js"] = """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"""

# 3. tailwind.config.js
files["tailwind.config.js"] = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FBF6EE',
          dark: '#F3EADC',
          card: '#FAF3E8',
        },
        terracotta: {
          DEFAULT: '#C1653A',
          hover: '#A6512A',
          light: '#F8EDE7',
          dark: '#8C3D18',
        },
        sage: {
          DEFAULT: '#8B9A7A',
          light: '#EEF3EA',
          dark: '#687857',
        },
        charcoal: {
          DEFAULT: '#2B2420',
          dark: '#1C1613',
          light: '#423933',
        },
        gold: {
          DEFAULT: '#D4A24C',
          light: '#F8EED7',
          dark: '#B0802E',
        },
        'warm-white': '#FFFDF9',
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'soft': '14px',
        'card': '18px',
        'pill': '9999px',
      },
      boxShadow: {
        'warm-sm': '0 2px 10px rgba(43, 36, 32, 0.05)',
        'warm-md': '0 8px 30px rgba(43, 36, 32, 0.08)',
        'warm-lg': '0 16px 48px rgba(43, 36, 32, 0.12)',
        'glow-terracotta': '0 0 25px rgba(193, 101, 58, 0.4)',
        'glow-gold': '0 0 25px rgba(212, 162, 76, 0.4)',
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
    },
  },
  plugins: [],
};
"""

# 4. index.html
files["index.html"] = """<!doctype html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23C1653A'/><circle cx='50' cy='50' r='18' fill='%23FBF6EE'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SmritiSathi — Keep Memories Alive | AI Cognitive Wellness</title>
    <meta name="description" content="Personalized cognitive care and memory assistance for elderly seniors and their caregivers. Smart India Hackathon 2026." />
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-cream text-charcoal selection:bg-terracotta/20 selection:text-terracotta font-sans antialiased overflow-x-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""

# 5. src/index.css
files["src/index.css"] = """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    background-color: #FBF6EE;
    color: #2B2420;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
}

/* Custom 3D Card Flip styles */
.perspective-1000 {
  perspective: 1000px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}

/* Frosted glass backdrop */
.glass-panel {
  background: rgba(255, 253, 249, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(193, 101, 58, 0.12);
}

.glass-panel-dark {
  background: rgba(43, 36, 32, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 162, 76, 0.18);
}

/* Paper texture simulation */
.paper-texture {
  background-image: radial-gradient(rgba(251, 246, 238, 0.04) 1px, transparent 0);
  background-size: 24px 24px;
}
"""

# 6. src/config/team.js
files["src/config/team.js"] = """// SmritiSathi - Hackathon Configuration
// Update team name, hackathon project details, and pilot stats here
export const TEAM_CONFIG = {
  teamName: "Team SmritiSathi",
  hackathon: "Smart India Hackathon 2026",
  organization: "Ministry of Social Justice & Empowerment",
  problemStatement: "AI-Powered Memory & Cognitive Assistance for Senior Citizens",
  location: "New Delhi · Bengaluru · Mumbai",
  copyrightYear: 2026,
  
  // Real or projected pilot benchmarks for Hackathon judges
  impactStats: [
    {
      value: "10,000+",
      number: 10000,
      suffix: "+",
      label: "Seniors Supported",
      caption: "Target cohort for pilot phase across community day-care centres and home trials.",
      highlight: true
    },
    {
      value: "40%",
      number: 40,
      suffix: "%",
      label: "Improvement in Engagement",
      caption: "Increase in daily active cognitive tasks and stimulated conversational recall.*",
      highlight: false
    },
    {
      value: "92%",
      number: 92,
      suffix: "%",
      label: "Caregivers Report Reduced Worry",
      caption: "Family members reporting heightened peace of mind with gentle real-time check-ins.*",
      highlight: false
    }
  ],
  statsDisclaimer: "*Projected targets & clinical trial benchmarks prepared for SIH 2026 validation."
};
"""

# 7. src/components/AudioChime.js
files["src/components/AudioChime.js"] = """// Procedural Web Audio API sound generator
// Zero external mp3 dependencies, works instantly offline, comforting elder-friendly tones

class AudioChimeService {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFlip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {
      console.warn(e);
    }
  }

  playMatch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Gentle Indian harp / singing bell chord (E5, G#5, B5, E6)
      const freqs = [659.25, 830.61, 987.77, 1318.51];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.65);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      melody.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + i * 0.09;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.85);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playVoicePreview() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Soft gentle two-tone notification chime
      [587.33, 880].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + i * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.55);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

export const chime = new AudioChimeService();
"""

for filepath, content in files.items():
    dirname = os.path.dirname(filepath)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Wrote:", filepath)

