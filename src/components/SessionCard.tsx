"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Session } from "@/types/session";
import { useSessionStore } from "@/stores/sessionStore";
import { TerminalPreview } from "./TerminalPreview";
import { InlineCommandInput } from "./InlineCommandInput";
import { XTerminal } from "./XTerminal";
import { ProgressBar } from "./ProgressBar";
import { TodoChips } from "./TodoChips";
import { QuickActions } from "./QuickActions";

interface Props {
  session: Session;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

const STATUS_NAME_COLOR: Record<string, string> = {
  running: "text-th-primary",
  done: "text-th-tertiary",
  error: "text-th-term-err",
  queued: "text-th-text-secondary",
};

function StatusDot({ session }: { session: Session }) {
  if (session.status === "done") {
    return <span className="material-symbols-outlined text-sm text-th-tertiary">check_circle</span>;
  }
  const colorClass =
    session.status === "running" ? "bg-th-primary"
      : session.status === "error" ? "bg-th-term-err"
        : "bg-th-text-muted";
  return (
    <span
      className={`w-2 h-2 rounded-full inline-block ${colorClass} ${session.status === "running" ? "animate-pulse" : ""} ${session.isMain ? "opacity-100" : "opacity-70"}`}
    />
  );
}

function SessionCardInner({ session }: Props) {
  const expanded = useSessionStore((s) => !!s.expandedCards[session.id]);
  const toggleExpanded = useSessionStore((s) => s.toggleExpanded);
  const sendCommand = useSessionStore((s) => s.sendCommand);
  const performAction = useSessionStore((s) => s.performAction);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
  });

  const dragStyle = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
    : undefined;

  const isActive = session.status === "running" && session.isMain;
  const showInput = session.status === "running" || session.status === "queued";
  const showTerminal = session.output.length > 0;
  const totalTasks = session.todoItems.length;
  const doneTasks = session.todoItems.filter((t) => t.done).length;

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
      data-session-id={session.id}
      className={`rounded-lg transition-all overflow-hidden bg-th-card border ${isDragging ? "opacity-50" : ""} ${
        isActive
          ? "border-th-primary-border shadow-[0_0_12px_var(--c-primary-bg)]"
          : session.status === "done"
            ? "border-th-tertiary/20"
            : "border-th-border"
      }`}
    >
      {isActive && (
        <div className="h-[3px] w-full bg-gradient-to-r from-[var(--c-gradient-from)] to-[var(--c-gradient-to)]" />
      )}

      <div className="p-3">
        <div className="flex items-start justify-between mb-2 cursor-pointer" onClick={() => toggleExpanded(session.id)}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusDot session={session} />
              <h3 className={`font-mono text-sm font-bold ${STATUS_NAME_COLOR[session.status] || "text-th-text-secondary"}`}>
                {session.name}
              </h3>
            </div>
            <p className="text-[11px] font-medium text-th-text-muted">{session.task}</p>
          </div>
          <div className="flex items-start gap-2 flex-shrink-0">
            <div className="text-right">
              {session.elapsed > 0 && (
                <div className={`font-mono text-[10px] ${
                  session.status === "running" ? "text-th-primary"
                    : session.status === "done" ? "text-th-tertiary/70"
                      : "text-th-text-muted"
                }`}>
                  {formatElapsed(session.elapsed)}
                </div>
              )}
              {totalTasks > 0 && (
                <div className="font-mono text-[9px] text-th-text-muted">
                  TASKS: {doneTasks}/{totalTasks}
                </div>
              )}
              {session.id && !session.isMain && session.status === "queued" && (
                <span className="font-mono text-[10px] text-th-text-muted">
                  ID: {session.id.slice(0, 4)}
                </span>
              )}
            </div>
            <span
              className="material-symbols-outlined text-th-text-muted transition-transform duration-200 text-sm"
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              expand_more
            </span>
          </div>
        </div>

        <ProgressBar progress={session.progress} status={session.status} />

        {/* Expanded running session: full xterm.js terminal */}
        {expanded && session.status === "running" && (
          <XTerminal sessionId={session.id} />
        )}

        {/* Collapsed or non-running: classified line preview */}
        {(!expanded || session.status !== "running") && showTerminal && (
          <TerminalPreview output={session.output} expanded={expanded} />
        )}

        {/* Inline command input only when collapsed and running/queued */}
        {!expanded && showInput && (
          <InlineCommandInput sessionId={session.id} sessionName={session.name} onSend={sendCommand} />
        )}

        {expanded && (
          <div className="mt-3 pt-3 border-t border-dashed border-th-border">
            <TodoChips items={session.todoItems} />
            <QuickActions status={session.status} onAction={(action) => performAction(session.id, action)} />
          </div>
        )}
      </div>
    </div>
  );
}

export const SessionCard = React.memo(SessionCardInner, (prev, next) =>
  prev.session === next.session
);
