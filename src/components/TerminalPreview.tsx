"use client";

import type { OutputLine } from "@/types/session";
import type { ThemeColors } from "@/lib/theme";

interface Props {
  output: OutputLine[];
  maxLines?: number;
  theme: ThemeColors;
}

function lineColor(t: OutputLine["t"], theme: ThemeColors): string {
  switch (t) {
    case "cmd": return theme.terminalCmd;
    case "ok": return theme.terminalOk;
    case "run": return theme.terminalRun;
    case "info": return theme.terminalInfo;
    case "err": return theme.terminalErr;
    case "user": return theme.primary;
    case "wait": return theme.textMuted;
    default: return theme.text;
  }
}

export function TerminalPreview({ output, maxLines = 4, theme }: Props) {
  const lines = output.slice(-maxLines);

  if (lines.length === 0) return null;

  return (
    <div
      className="rounded p-2 mb-3 font-mono text-[10px] leading-relaxed terminal-scroll overflow-y-auto max-h-24"
      style={{
        backgroundColor: theme.terminal,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: theme.border,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-2" style={{ color: lineColor(line.t, theme) }}>
          {line.t === "run" && (
            <span
              className="animate-spinner inline-block h-2 w-2 border border-current border-t-transparent rounded-full mt-0.5 flex-shrink-0"
              style={{ fontSize: "8px" }}
            />
          )}
          <span>{line.v}</span>
        </div>
      ))}
    </div>
  );
}
