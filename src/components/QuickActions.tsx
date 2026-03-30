"use client";

import type { SessionStatus } from "@/types/session";

interface Props {
  status: SessionStatus;
  onAction: (action: "abort" | "start") => void;
}

export function QuickActions({ status, onAction }: Props) {
  if (status === "done" || status === "error") return null;

  return (
    <div className="flex gap-2">
      {status === "queued" && (
        <button
          onClick={() => onAction("start")}
          className="font-mono text-[10px] px-2 py-1 rounded transition-opacity hover:opacity-80 bg-th-primary-bg text-th-primary border border-th-primary-border"
        >
          {"▶ 開始"}
        </button>
      )}
      {status === "running" && (
        <button
          onClick={() => onAction("abort")}
          className="font-mono text-[10px] px-2 py-1 rounded transition-opacity hover:opacity-80 btn-error"
        >
          {"✕ 中断"}
        </button>
      )}
    </div>
  );
}
