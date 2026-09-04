/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NYNÄ palette. Slate is remapped to a cool blue-gray scale with a warm
        // cream top so all existing slate-* text/surfaces adopt the new theme.
        slate: {
          50:  "#fbf7f2",
          100: "#f6efe6", // Seashell-tinted — headings / body text
          200: "#e7ddd0",
          300: "#c6ccd8", // light cool gray-blue
          400: "#98a2b4", // muted labels
          500: "#717b92",
          600: "#565f78",
          700: "#3f4559",
          800: "#2b273f",
          900: "#211c32", // dark violet surface
          950: "#16111f", // near-ground
        },
        dark: {
          bg: "#141020",      // deep violet-navy ground
          card: "#211b31",    // dark violet surface
          border: "#3a3352",  // muted violet border
          accent: "#a6bcc9",  // Powder Blue
        },
        brand: {
          primary: "#3e4b8e",   // French Blue — fills / gradients
          secondary: "#f6e0b6", // Wheat — warm accent
          cyan: "#a6bcc9",      // Powder Blue — main bright accent
          rose: "#e0708a",      // harmonized alert rose
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
          '0%': { boxShadow: '0 0 20px 0px rgba(62, 75, 142, 0.18)' },
          '100%': { boxShadow: '0 0 40px 10px rgba(166, 188, 201, 0.28)' },
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
        'grid-pattern': "radial-gradient(circle, rgba(166, 188, 201, 0.08) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
