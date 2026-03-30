import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Dark theme tokens
        dark: {
          bg: "#09090f",
          card: "#0d0d18",
          terminal: "#07070c",
          surface: "#131319",
          "surface-container": "#1f1f26",
          "surface-container-low": "#1b1b21",
          "surface-container-high": "#2a2930",
          "surface-container-highest": "#35343b",
          "surface-container-lowest": "#0e0e14",
          border: "#3c494c",
        },
        // Light theme tokens
        light: {
          bg: "#f8fafc",
          card: "#ffffff",
          terminal: "#f1f5f9",
          surface: "#ffffff",
          "surface-container": "#ffffff",
          "surface-container-high": "#f1f5f9",
          border: "#e2e8f0",
        },
        // Beige (Solarized) theme tokens
        beige: {
          bg: "#fdf6e3",
          card: "#eee8d5",
          terminal: "#002b36",
          surface: "#eee8d5",
          border: "#d3af86",
          base01: "#586e75",
          base1: "#93a1a1",
        },
        // Shared accent colors
        accent: {
          cyan: "#22d3ee",
          "cyan-dark": "#0891b2",
          "cyan-solarized": "#2aa198",
          green: "#61f6b9",
          "green-light": "#16a34a",
          "green-solarized": "#859900",
          purple: "#cebdff",
          "purple-light": "#7c3aed",
          "purple-solarized": "#6c71c4",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        jp: ["Noto Sans JP", "sans-serif"],
        body: ["Noto Sans JP", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
