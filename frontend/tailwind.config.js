/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutralize the default slate scale so all existing slate-* text and
        // surfaces lose their blue tint and read as monochrome grays.
        slate: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#141414",
          950: "#0a0a0a",
        },
        dark: {
          bg: "#050505",      // near-black ground
          card: "#101010",    // dark monochrome surface
          border: "#2a2a2a",  // neutral gray border
          accent: "#6bff81",  // signature mint-green
        },
        brand: {
          primary: "#39e070",   // green
          secondary: "#24b957", // deeper green
          cyan: "#6bff81",      // signature mint (main accent)
          rose: "#ff5c6a",      // semantic red (errors / hard / low scores)
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
          '0%': { boxShadow: '0 0 20px 0px rgba(107, 255, 129, 0.12)' },
          '100%': { boxShadow: '0 0 40px 10px rgba(107, 255, 129, 0.28)' },
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
        'grid-pattern': "radial-gradient(circle, rgba(107, 255, 129, 0.08) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
