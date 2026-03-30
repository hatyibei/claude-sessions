import type { ThemeMode } from "@/types/session";

export interface ThemeColors {
  bg: string;
  card: string;
  terminal: string;
  surface: string;
  surfaceHigh: string;
  surfaceLowest: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryBg: string;
  primaryBorder: string;
  secondary: string;
  tertiary: string;
  tertiaryBg: string;
  inputBg: string;
  inputBorder: string;
  inputPlaceholder: string;
  headerBg: string;
  headerBorder: string;
  footerBg: string;
  footerBorder: string;
  terminalCmd: string;
  terminalOk: string;
  terminalRun: string;
  terminalInfo: string;
  terminalErr: string;
  gradientFrom: string;
  gradientTo: string;
  selection: string;
}

const darkTheme: ThemeColors = {
  bg: "#09090f",
  card: "#0d0d18",
  terminal: "#07070c",
  surface: "#131319",
  surfaceHigh: "#2a2930",
  surfaceLowest: "#0e0e14",
  border: "rgba(60,73,76,0.2)",
  borderSubtle: "rgba(60,73,76,0.5)",
  text: "#e4e1ea",
  textSecondary: "#bbc9cd",
  textMuted: "#6b7280",
  primary: "#22d3ee",
  primaryBg: "rgba(6,182,212,0.08)",
  primaryBorder: "rgba(6,182,212,0.3)",
  secondary: "#cebdff",
  tertiary: "#61f6b9",
  tertiaryBg: "rgba(16,185,129,0.08)",
  inputBg: "#0e0e14",
  inputBorder: "transparent",
  inputPlaceholder: "#374151",
  headerBg: "#09090f",
  headerBorder: "#1b1b21",
  footerBg: "rgba(14,14,20,0.9)",
  footerBorder: "rgba(8,145,178,0.3)",
  terminalCmd: "#a78bfa",
  terminalOk: "#61f6b9",
  terminalRun: "#22d3ee",
  terminalInfo: "#4b5563",
  terminalErr: "#f87171",
  gradientFrom: "#22d3ee",
  gradientTo: "#a78bfa",
  selection: "rgba(34,211,238,0.3)",
};

const lightTheme: ThemeColors = {
  bg: "#f8fafc",
  card: "#ffffff",
  terminal: "#f1f5f9",
  surface: "#ffffff",
  surfaceHigh: "#f1f5f9",
  surfaceLowest: "#f8fafc",
  border: "#e2e8f0",
  borderSubtle: "#e2e8f0",
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  primary: "#0891b2",
  primaryBg: "rgba(8,145,178,0.05)",
  primaryBorder: "rgba(8,145,178,0.3)",
  secondary: "#7c3aed",
  tertiary: "#16a34a",
  tertiaryBg: "rgba(22,163,74,0.05)",
  inputBg: "#f8fafc",
  inputBorder: "#e2e8f0",
  inputPlaceholder: "#cbd5e1",
  headerBg: "#ffffff",
  headerBorder: "#e2e8f0",
  footerBg: "rgba(255,255,255,0.8)",
  footerBorder: "#e2e8f0",
  terminalCmd: "#7c3aed",
  terminalOk: "#16a34a",
  terminalRun: "#0891b2",
  terminalInfo: "#94a3b8",
  terminalErr: "#dc2626",
  gradientFrom: "#06b6d4",
  gradientTo: "#8b5cf6",
  selection: "rgba(8,145,178,0.1)",
};

const beigeTheme: ThemeColors = {
  bg: "#fdf6e3",
  card: "#eee8d5",
  terminal: "#002b36",
  surface: "#eee8d5",
  surfaceHigh: "#eee8d5",
  surfaceLowest: "#fdf6e3",
  border: "#d3af86",
  borderSubtle: "rgba(211,175,134,0.5)",
  text: "#586e75",
  textSecondary: "#657b83",
  textMuted: "#93a1a1",
  primary: "#2aa198",
  primaryBg: "rgba(42,161,152,0.1)",
  primaryBorder: "rgba(42,161,152,0.3)",
  secondary: "#6c71c4",
  tertiary: "#859900",
  tertiaryBg: "rgba(133,153,0,0.1)",
  inputBg: "#fdf6e3",
  inputBorder: "rgba(211,175,134,0.5)",
  inputPlaceholder: "rgba(147,161,161,0.5)",
  headerBg: "#fdf6e3",
  headerBorder: "#d3af86",
  footerBg: "rgba(253,246,227,0.9)",
  footerBorder: "#d3af86",
  terminalCmd: "#6c71c4",
  terminalOk: "#859900",
  terminalRun: "#2aa198",
  terminalInfo: "#93a1a1",
  terminalErr: "#dc322f",
  gradientFrom: "#2aa198",
  gradientTo: "#6c71c4",
  selection: "rgba(42,161,152,0.3)",
};

export function getTheme(mode: ThemeMode): ThemeColors {
  switch (mode) {
    case "dark": return darkTheme;
    case "light": return lightTheme;
    case "beige": return beigeTheme;
  }
}
