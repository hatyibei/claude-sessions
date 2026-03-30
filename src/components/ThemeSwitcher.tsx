"use client";

import type { ThemeMode } from "@/types/session";

interface Props {
  current: ThemeMode;
  onChange: (theme: ThemeMode) => void;
}

const themes: { mode: ThemeMode; icon: string; title: string }[] = [
  { mode: "dark", icon: "dark_mode", title: "Dark Mode" },
  { mode: "light", icon: "light_mode", title: "Light Mode" },
  { mode: "beige", icon: "palette", title: "Beige Mode" },
];

export function ThemeSwitcher({ current, onChange }: Props) {
  return (
    <div className="flex p-0.5 rounded-lg shadow-inner bg-th-surface-high border border-th-border">
      {themes.map(({ mode, icon, title }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`flex items-center justify-center w-7 h-7 rounded transition-all duration-200 ${
            current === mode ? "text-th-primary bg-th-surface-high" : "text-th-text-muted"
          }`}
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
