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
        sans: ["IBM Plex Sans", "sans-serif"],
      },
      colors: {
        // Running OS design tokens
        ros: {
          bg:      "#0A0A0A",
          surface: "#111111",
          card:    "#161616",
          border:  "#222222",
          border2: "#2A2A2A",
          faint:   "#383838",
          mid:     "#555555",
          muted:   "#777777",
          text:    "#E8E8E4",
          bright:  "#F5F5F1",
          green:   "#4ADE80",
          amber:   "#FBBF24",
          red:     "#F87171",
          blue:    "#60A5FA",
        },
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
      },
    },
  },
  plugins: [],
};

export default config;
