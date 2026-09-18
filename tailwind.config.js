/** @type {import('tailwindcss').Config} */
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
