"use client";

import type { OutputLine } from "@/types/session";

interface Props {
  output: OutputLine[];
  expanded?: boolean;
}

const LINE_COLORS: Record<OutputLine["t"], string> = {
  cmd: "text-th-term-cmd",
  ok: "text-th-term-ok",
  run: "text-th-term-run",
  info: "text-th-term-info",
  err: "text-th-term-err",
  user: "text-th-primary",
  wait: "text-th-text-muted",
};

export function TerminalPreview({ output, expanded = false }: Props) {
  const lines = expanded ? output : output.slice(-3);

  if (lines.length === 0) return null;

  return (
    <div
      className={`rounded p-2 mb-3 font-mono text-[10px] leading-relaxed terminal-scroll bg-th-terminal border border-th-border transition-[max-height] duration-300 ease-in-out ${
        expanded ? "max-h-[200px] overflow-y-auto" : "max-h-14 overflow-hidden"
      }`}
    >
      {lines.map((line, i) => (
        <div key={`${line.ts}-${i}`} className={`flex items-start gap-2 ${LINE_COLORS[line.t] || "text-th-text"}`}>
          {line.t === "run" && (
            <span className="animate-spinner inline-block h-2 w-2 border border-current border-t-transparent rounded-full mt-0.5 flex-shrink-0" />
          )}
          <span>{line.v}</span>
          {i === lines.length - 1 && line.t === "run" && (
            <span className="terminal-cursor inline-block w-[6px] h-[12px] ml-0.5 align-middle flex-shrink-0 bg-th-term-run" />
          )}
        </div>
      ))}
    </div>
  );
}
