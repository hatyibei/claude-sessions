"use client";

import type { ThemeMode } from "@/types/session";
import type { ThemeColors } from "@/lib/theme";

interface Props {
  current: ThemeMode;
  onChange: (theme: ThemeMode) => void;
  theme: ThemeColors;
}

const themes: { mode: ThemeMode; icon: string; title: string }[] = [
  { mode: "dark", icon: "dark_mode", title: "Dark Mode" },
  { mode: "light", icon: "light_mode", title: "Light Mode" },
  { mode: "beige", icon: "palette", title: "Beige Mode" },
];

export function ThemeSwitcher({ current, onChange, theme }: Props) {
  return (
    <div
      className="flex p-0.5 rounded-lg shadow-inner"
      style={{
        backgroundColor: theme.surfaceHigh,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: theme.border,
      }}
    >
      {themes.map(({ mode, icon, title }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className="flex items-center justify-center w-7 h-7 rounded transition-all duration-200"
          style={{
            color: current === mode ? theme.primary : theme.textMuted,
            backgroundColor: current === mode ? theme.surfaceHigh : "transparent",
          }}
          title={title}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            {icon}
          </span>
        </button>
      ))}
    </div>
  );
}
