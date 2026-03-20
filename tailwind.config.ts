import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
        sans: ["Manrope", "sans-serif"],
      },
      colors: {
        ros: {
          bg:      "#060708",
          surface: "#0c0e11",
          panel:   "#111418",
          card:    "#14181d",
          card2:   "#171c21",
          border:  "#242a31",
          border2: "#313842",
          faint:   "#49515d",
          mid:     "#67707d",
          muted:   "#98a2af",
          text:    "#d7dde6",
          bright:  "#f5f7fa",
          green:   "#88b89a",
          amber:   "#b79a69",
          red:     "#b67d76",
          blue:    "#90a9c7",
          steel:   "#b8c0cc",
        },
      },
      boxShadow: {
        "ros-panel": "0 24px 60px rgba(0,0,0,0.35)",
        "ros-card": "0 14px 36px rgba(0,0,0,0.28)",
      },
      backgroundImage: {
        "ros-shell":
          "radial-gradient(circle at top left, rgba(184,192,204,0.08), transparent 28%), radial-gradient(circle at top right, rgba(144,169,199,0.08), transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0))",
      },
      animation: {
        "wave-1": "wave 1.6s ease-in-out 0.00s infinite",
        "wave-2": "wave 1.6s ease-in-out 0.12s infinite",
        "wave-3": "wave 1.6s ease-in-out 0.24s infinite",
        "wave-4": "wave 1.6s ease-in-out 0.36s infinite",
        "wave-5": "wave 1.6s ease-in-out 0.48s infinite",
        "wave-6": "wave 1.6s ease-in-out 0.60s infinite",
        "wave-7": "wave 1.6s ease-in-out 0.72s infinite",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "fade-rise": "fadeRise 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        wave: {
          "0%, 100%": { opacity: "1", transform: "scaleY(1)" },
          "50%":       { opacity: "0.15", transform: "scaleY(0.5)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 6px rgba(74,222,128,0.5)" },
          "50%":       { opacity: "0.6", boxShadow: "0 0 12px rgba(74,222,128,0.3)" },
        },
        fadeRise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
