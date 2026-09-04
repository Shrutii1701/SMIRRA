/** @type {import('tailwindcss').Config} */
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // All colors are driven by CSS variables so themes can swap at runtime
        // (see index.css :root and [data-theme="mocha"]).
        slate: {
          50: c('--c-slate-50'),
          100: c('--c-slate-100'),
          200: c('--c-slate-200'),
          300: c('--c-slate-300'),
          400: c('--c-slate-400'),
          500: c('--c-slate-500'),
          600: c('--c-slate-600'),
          700: c('--c-slate-700'),
          800: c('--c-slate-800'),
          900: c('--c-slate-900'),
          950: c('--c-slate-950'),
        },
        dark: {
          bg: c('--c-dark-bg'),
          card: c('--c-dark-card'),
          border: c('--c-dark-border'),
          accent: c('--c-dark-accent'),
        },
        brand: {
          primary: c('--c-brand-primary'),
          secondary: c('--c-brand-secondary'),
          cyan: c('--c-brand-cyan'),
          rose: c('--c-brand-rose'),
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'glow-slow': 'glow 8s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px 0px rgb(var(--c-brand-primary) / 0.18)' },
          '100%': { boxShadow: '0 0 40px 10px rgb(var(--c-brand-cyan) / 0.28)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgb(var(--c-dark-accent) / 0.08) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
