import type { Config } from "tailwindcss";

/** Template 4 "Kesariya" palette: paper cream · sindoor red · kesar saffron · haldi · peacock teal · rani pink · sona gold */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#FFF8EE", 100: "#FFFCF6", 200: "#FBEFD9", 300: "#F3DFB8" },
        sindoor: { 900: "#3D040C", 800: "#5E0814", 700: "#8F0E21", 600: "#B3001B", 500: "#D11A2A" },
        kesar: { 300: "#FFC46B", 400: "#FFAA33", 500: "#F28C0F", 600: "#D9730A" },
        haldi: { 300: "#FFE27A", 400: "#F7C71C" },
        peacock: { 900: "#06343A", 800: "#0B4A52", 700: "#0E6E6E", 500: "#1A9C95" },
        rani: { 300: "#F28FB2", 400: "#E94C89" },
        sona: { 200: "#F8EBC4", 300: "#F1D98A", 400: "#E2BE5A", 500: "#D4AF37", 600: "#B08D22" },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        warm: "0 24px 60px -28px rgba(94, 8, 20, 0.45)",
        deep: "0 40px 90px -40px rgba(61, 4, 12, 0.75)",
        sona: "0 0 0 1px rgba(212, 175, 55, 0.45), 0 20px 50px -24px rgba(176, 141, 34, 0.6)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        swing: { "0%, 100%": { transform: "rotate(-4deg)" }, "50%": { transform: "rotate(4deg)" } },
        flicker: { "0%, 100%": { transform: "scale(1, 1)", opacity: "1" }, "50%": { transform: "scale(0.9, 1.12)", opacity: "0.85" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        eq: { "0%, 100%": { transform: "scaleY(0.3)" }, "50%": { transform: "scaleY(1)" } },
        "scroll-line": { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(200%)" } },
      },
      animation: {
        marquee: "marquee 34s linear infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        swing: "swing 3.2s ease-in-out infinite",
        flicker: "flicker 0.9s ease-in-out infinite",
        "spin-slow": "spin-slow 60s linear infinite",
        eq: "eq 1s ease-in-out infinite",
        "scroll-line": "scroll-line 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
