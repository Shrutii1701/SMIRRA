/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#05070f",
          card: "#0d1127",
          border: "#1e295d",
          accent: "#22c55e",
        },
        brand: {
          primary: "#6366f1", // Indigo
          secondary: "#a855f7", // Purple
          cyan: "#06b6d4", // Cyan
          rose: "#f43f5e", // Rose
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
          '0%': { boxShadow: '0 0 20px 0px rgba(99, 102, 241, 0.15)' },
          '100%': { boxShadow: '0 0 40px 10px rgba(6, 182, 212, 0.3)' },
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
        'grid-pattern': "radial-gradient(circle, rgba(99, 102, 241, 0.1) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}

