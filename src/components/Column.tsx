"use client";

import type { Session, SessionStatus } from "@/types/session";
import { SessionCard } from "./SessionCard";

interface Props {
  title: string;
  status: SessionStatus;
  sessions: Session[];
  expandedCards: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onSendCommand: (sessionId: string, command: string) => void;
  onAction: (sessionId: string, action: "abort" | "start") => void;
}

const COLUMN_ICON: Record<string, string> = {
  queued: "more_horiz",
  running: "bolt",
  done: "verified",
};

const TITLE_COLOR: Record<string, string> = {
  running: "text-th-primary",
  done: "text-th-tertiary",
  queued: "text-th-text-muted",
};

const COUNT_BG: Record<string, string> = {
  running: "bg-th-primary-bg",
  done: "bg-th-tertiary-bg",
  queued: "bg-th-surface-high",
};

export function Column({ title, status, sessions, expandedCards, onToggleExpand, onSendCommand, onAction }: Props) {
  const titleClass = TITLE_COLOR[status] || "text-th-text-muted";
  const countClass = COUNT_BG[status] || "bg-th-surface-high";

  return (
    <section className="flex-shrink-0 w-[380px] flex flex-col gap-3">
      <div className="flex items-center justify-between px-2 mb-1">
        <div className="flex items-center gap-2">
          <span className={`font-mono text-xs font-bold uppercase tracking-tighter ${titleClass}`}>
            {title}
          </span>
          <span className={`font-mono text-[10px] px-1.5 rounded ${countClass} ${titleClass}`}>
            {sessions.length}
          </span>
        </div>
        <span className={`material-symbols-outlined text-sm ${titleClass} opacity-50`}>
          {COLUMN_ICON[status] || "more_horiz"}
        </span>
      </div>

      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          expanded={!!expandedCards[session.id]}
          onToggleExpand={() => onToggleExpand(session.id)}
          onSendCommand={onSendCommand}
          onAction={onAction}
        />
      ))}
    </section>
  );
}
