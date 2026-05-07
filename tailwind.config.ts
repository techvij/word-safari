import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Playful palette tuned for kids 6-12
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        bamboo: {
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        sunset: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        berry: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
      },
      fontFamily: {
        display: ['"Fredoka"', '"Comic Sans MS"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floatBob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.18)' },
          '60%': { transform: 'scale(1.1)' },
        },
        pictureBounce: {
          '0%': { transform: 'scale(0.3) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(1.15) rotate(8deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        'float-bob': 'floatBob 3s ease-in-out infinite',
        'pop-in': 'popIn 0.35s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        heartbeat: 'heartbeat 1.4s ease-in-out infinite',
        'picture-bounce': 'pictureBounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'confetti-fall': 'confettiFall var(--duration, 3s) linear forwards',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
