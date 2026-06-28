import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#08080B",
        surface: "rgba(255,255,255,0.02)",
        "surface-border": "rgba(255,255,255,0.06)",
        "surface-border-strong": "rgba(255,255,255,0.14)",
        accent: {
          DEFAULT: "#6366F1",
          hover: "#7C7FF2",
          muted: "rgba(99,102,241,0.15)",
        },
        cyan: {
          DEFAULT: "#22D3EE",
          muted: "rgba(34,211,238,0.15)",
        },
        // category colors
        career: "#6366F1",
        health: "#22D3EE",
        financial: "#F59E0B",
        personal: "#EC4899",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      backdropBlur: {
        glass: "12px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
