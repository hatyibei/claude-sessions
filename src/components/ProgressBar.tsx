"use client";

import type { SessionStatus } from "@/types/session";

interface Props {
  progress: number;
  status: SessionStatus;
}

export function ProgressBar({ progress, status }: Props) {
  const barClass =
    status === "done" ? "bg-th-tertiary"
      : status === "running" ? "bg-gradient-to-r from-[var(--c-gradient-from)] to-[var(--c-gradient-to)]"
        : "bg-th-text-muted";

  return (
    <div className="w-full h-[2px] rounded-full mb-3 relative overflow-hidden bg-th-text-muted/15">
      <div
        className={`h-full rounded-full relative transition-all duration-500 ${barClass}`}
        style={{ width: `${progress}%` }}
      >
        {status === "running" && progress > 0 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 blur-md bg-th-primary/40" />
        )}
      </div>
    </div>
  );
}
