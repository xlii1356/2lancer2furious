import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0d1112",
        surface: "#171d1e",
        "surface-translucent": "rgba(23, 29, 30, 0.8)",
        primary: "#c83232",
        "primary-logo": "#0c3c40",
        "secondary-logo": "#146464",
        "text-hi": "rgba(255, 255, 255, 0.87)",
        "text-mid": "rgba(255, 255, 255, 0.67)",
        "text-low": "rgba(255, 255, 255, 0.47)",
        separator: "rgba(255, 255, 255, 0.24)",
        "mission-start": "#6d6d6d",
        "mission-partial": "#582266",
        "mission-success": "#226662",
        "mission-failure": "#b02d2d",
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', "cursive"],
        label: ['"Titillium Web"', "sans-serif"],
        eyebrow: ['"Raleway"', "sans-serif"],
        mono: ['"Inconsolata"', "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
