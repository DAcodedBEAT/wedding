import type { Config } from "tailwindcss";

/**
 * Palette is kept in sync with the monogram assets:
 *  - ivory  #f5f1ec  (card stock from monogram-as-*.svg)
 *  - gold   #cda86a  (GOLD from MonogramCrestLottie.tsx; foil gradient
 *                     stops #9c7b3f → #f6e7c8 → #8a6a35 live in CSS)
 *  - lilac            the wedding's purple/lilac, scaled here
 *  - ink    #1a1a1a  (mark/text colour)
 * The same values are mirrored in src/config/wedding.ts `theme` for any
 * runtime use; this file is the Tailwind-token source of truth.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#f5f1ec",
          50: "#fdfcfa",
          100: "#f8f4ef",
          200: "#f5f1ec",
          300: "#eee7dd",
          400: "#e3d8c9",
        },
        lilac: {
          50: "#f6f3fb",
          100: "#ece5f6",
          200: "#dcd0ee",
          300: "#c6b3e1",
          400: "#b9a3d6",
          500: "#9f84c4",
          600: "#8467ac",
          700: "#6b528c",
          800: "#574272",
          900: "#3c2d50",
        },
        gold: {
          DEFAULT: "#cda86a",
          light: "#e8c992",
          mid: "#cda86a",
          deep: "#8a6a35",
          spark: "#fff6e6",
        },
        ink: "#1a1a1a",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Jost'", "'Helvetica Neue'", "Arial", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.35em",
        widest3: "0.5em",
      },
      boxShadow: {
        gold: "0 1px 0 rgba(205,168,106,0.4), 0 10px 30px -12px rgba(60,45,80,0.35)",
        card: "0 18px 50px -24px rgba(60,45,80,0.45)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        sweep: {
          "0%": { transform: "translateX(-130%) skewX(-12deg)", opacity: "0" },
          "40%": { opacity: "0.8" },
          "100%": { transform: "translateX(130%) skewX(-12deg)", opacity: "0" },
        },
        draw: { to: { strokeDashoffset: "0" } },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        breathe: {
          "0%,100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.04)" },
        },
        rise: {
          "0%": { transform: "translateY(110vh) translateX(0)", opacity: "0" },
          "10%": { opacity: "0.8" },
          "90%": { opacity: "0.6" },
          "100%": { transform: "translateY(-10vh) translateX(20px)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
        sweep: "sweep 2.4s ease-in-out",
        floaty: "floaty 6s ease-in-out infinite",
        "fade-up": "fade-up 0.7s ease both",
        breathe: "breathe 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
