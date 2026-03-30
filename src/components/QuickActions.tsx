"use client";

import type { SessionStatus } from "@/types/session";
import type { ThemeColors } from "@/lib/theme";

interface Props {
  status: SessionStatus;
  theme: ThemeColors;
  onAction: (action: "pause" | "abort" | "start" | "rerun") => void;
}

export function QuickActions({ status, theme, onAction }: Props) {
  if (status === "done") return null;

  return (
    <div className="flex gap-2">
      {status === "queued" && (
        <button
          onClick={() => onAction("start")}
          className="font-mono text-[10px] px-2 py-1 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: theme.primaryBg,
            color: theme.primary,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: theme.primaryBorder,
          }}
        >
          \u25B6 \u958B\u59CB
        </button>
      )}
      {status === "running" && (
        <button
          onClick={() => onAction("abort")}
          className="font-mono text-[10px] px-2 py-1 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "rgba(248,113,113,0.1)",
            color: theme.terminalErr,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "rgba(248,113,113,0.3)",
          }}
        >
          \u2715 \u4E2D\u65AD
        </button>
      )}
      {status === "error" && (
        <button
          onClick={() => onAction("rerun")}
          className="font-mono text-[10px] px-2 py-1 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: theme.primaryBg,
            color: theme.primary,
          }}
        >
          \u21BB \u518D\u5B9F\u884C
        </button>
      )}
    </div>
  );
}
