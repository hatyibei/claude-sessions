import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        th: {
          bg: "var(--c-bg)",
          card: "var(--c-card)",
          terminal: "var(--c-terminal)",
          surface: "var(--c-surface)",
          "surface-high": "var(--c-surface-high)",
          "surface-lowest": "var(--c-surface-lowest)",
          border: "var(--c-border)",
          text: "var(--c-text)",
          "text-secondary": "var(--c-text-secondary)",
          "text-muted": "var(--c-text-muted)",
          primary: "var(--c-primary)",
          "primary-bg": "var(--c-primary-bg)",
          "primary-border": "var(--c-primary-border)",
          tertiary: "var(--c-tertiary)",
          "tertiary-bg": "var(--c-tertiary-bg)",
          "input-bg": "var(--c-input-bg)",
          "input-border": "var(--c-input-border)",
          "header-bg": "var(--c-header-bg)",
          "header-border": "var(--c-header-border)",
          "footer-bg": "var(--c-footer-bg)",
          "footer-border": "var(--c-footer-border)",
          "term-cmd": "var(--c-term-cmd)",
          "term-ok": "var(--c-term-ok)",
          "term-run": "var(--c-term-run)",
          "term-info": "var(--c-term-info)",
          "term-err": "var(--c-term-err)",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        body: ["Noto Sans JP", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
