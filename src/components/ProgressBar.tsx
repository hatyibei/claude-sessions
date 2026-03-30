"use client";

import type { SessionStatus } from "@/types/session";
import type { ThemeColors } from "@/lib/theme";

interface Props {
  progress: number;
  status: SessionStatus;
  theme: ThemeColors;
}

export function ProgressBar({ progress, status, theme }: Props) {
  const barColor =
    status === "done"
      ? theme.tertiary
      : status === "running"
        ? `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`
        : theme.textMuted;

  const trackColor =
    status === "done"
      ? theme.tertiaryBg
      : "rgba(128,128,128,0.15)";

  return (
    <div
      className="w-full h-[2px] rounded-full mb-3 relative overflow-hidden"
      style={{ backgroundColor: trackColor }}
    >
      <div
        className="h-full rounded-full relative transition-all duration-500"
        style={{
          width: `${progress}%`,
          background: barColor,
        }}
      >
        {status === "running" && progress > 0 && (
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 blur-md"
            style={{ backgroundColor: `${theme.primary}40` }}
          />
        )}
      </div>
    </div>
  );
}
