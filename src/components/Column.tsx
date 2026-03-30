"use client";

import type { Session, SessionStatus } from "@/types/session";
import type { ThemeColors } from "@/lib/theme";
import { SessionCard } from "./SessionCard";

interface Props {
  title: string;
  status: SessionStatus;
  sessions: Session[];
  expandedCards: Set<string>;
  onToggleExpand: (id: string) => void;
  onSendCommand: (sessionId: string, command: string) => void;
  onAction: (sessionId: string, action: "pause" | "abort" | "start" | "rerun") => void;
  theme: ThemeColors;
}

function columnIcon(status: SessionStatus): string {
  switch (status) {
    case "queued": return "more_horiz";
    case "running": return "bolt";
    case "done": return "verified";
    default: return "more_horiz";
  }
}

export function Column({ title, status, sessions, expandedCards, onToggleExpand, onSendCommand, onAction, theme }: Props) {
  const titleColor =
    status === "running" ? theme.primary
      : status === "done" ? theme.tertiary
        : theme.textMuted;

  const countBg =
    status === "running" ? theme.primaryBg
      : status === "done" ? theme.tertiaryBg
        : theme.surfaceHigh;

  return (
    <section className="flex-shrink-0 w-[380px] flex flex-col gap-3">
      <div className="flex items-center justify-between px-2 mb-1">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-xs font-bold uppercase tracking-tighter"
            style={{ color: titleColor }}
          >
            {title}
          </span>
          <span
            className="font-mono text-[10px] px-1.5 rounded"
            style={{ backgroundColor: countBg, color: titleColor }}
          >
            {sessions.length}
          </span>
        </div>
        <span
          className="material-symbols-outlined text-sm"
          style={{ color: `${titleColor}80` }}
        >
          {columnIcon(status)}
        </span>
      </div>

      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          expanded={expandedCards.has(session.id)}
          onToggleExpand={() => onToggleExpand(session.id)}
          onSendCommand={onSendCommand}
          onAction={onAction}
          theme={theme}
        />
      ))}
    </section>
  );
}
