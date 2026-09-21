import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
        gold: {
          400: "#f0d78c",
          500: "#d4af37",
          600: "#b8860b",
        },
        stage: {
          950: "#0a0a0c",
          900: "#121218",
          800: "#1a1a24",
          700: "#242430",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "stage-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(147, 51, 234, 0.25), transparent)",
        "gold-shine":
          "linear-gradient(135deg, #d4af37 0%, #f0d78c 50%, #b8860b 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
