/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Primary Palette ──────────────────────────────────────────
        cream: "#F5F0E8",
        "cream-2": "#EDE8DF",
        "cream-3": "#E2DDD4",
        "cream-4": "#D4CFC6",
        jet: "#111111",
        "jet-2": "#1A1A1A",
        "jet-3": "#2A2A2A",
        gold: "#C9A84C",
        "gold-2": "#B8952E",
        // ── Keep orange for backwards compat ─────────────────────────
        orange: "#C9A84C",
        // ── Semantic ─────────────────────────────────────────────────
        dark: {
          100: "#FFFFFF",
          200: "#F5F0E8",
          300: "#EDE8DF",
          400: "#E2DDD4",
        },
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.6s ease forwards",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        spin: "spin 1s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: "translateY(30px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201,168,76,0.3)" },
          "50%": { boxShadow: "0 0 0 12px rgba(201,168,76,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
