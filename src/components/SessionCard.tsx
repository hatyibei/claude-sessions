"use client";

import { useCallback } from "react";
import type { Session } from "@/types/session";
import type { ThemeColors } from "@/lib/theme";
import { TerminalPreview } from "./TerminalPreview";
import { InlineCommandInput } from "./InlineCommandInput";
import { ProgressBar } from "./ProgressBar";
import { TodoChips } from "./TodoChips";
import { QuickActions } from "./QuickActions";

interface Props {
  session: Session;
  expanded: boolean;
  onToggleExpand: () => void;
  onSendCommand: (sessionId: string, command: string) => void;
  theme: ThemeColors;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function statusDot(session: Session, theme: ThemeColors) {
  if (session.status === "done") {
    return (
      <span className="material-symbols-outlined text-sm" style={{ color: theme.tertiary }}>
        check_circle
      </span>
    );
  }
  const color =
    session.status === "running" ? theme.primary
      : session.status === "error" ? theme.terminalErr
        : theme.textMuted;
  return (
    <span
      className={`w-2 h-2 rounded-full inline-block ${session.status === "running" ? "animate-pulse" : ""}`}
      style={{ backgroundColor: color, opacity: session.isMain ? 1 : 0.7 }}
    />
  );
}

export function SessionCard({ session, expanded, onToggleExpand, onSendCommand, theme }: Props) {
  const isActive = session.status === "running" && session.isMain;
  const showInput = session.status === "running" || session.status === "queued";
  const showTerminal = session.output.length > 0;
  const totalTasks = session.todoItems.length;
  const doneTasks = session.todoItems.filter((t) => t.done).length;

  const handleAction = useCallback((action: "pause" | "abort" | "rerun") => {
    // Mock: just log for now
    console.log(`Action: ${action} on ${session.id}`);
  }, [session.id]);

  const cardBorder = isActive
    ? theme.primaryBorder
    : session.status === "done"
      ? `${theme.tertiary}33`
      : theme.border;

  return (
    <div
      className="rounded-lg transition-all overflow-hidden"
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: cardBorder,
        ...(isActive ? { boxShadow: `0 0 12px ${theme.primary}15` } : {}),
      }}
    >
      {/* Gradient top bar for active card */}
      {isActive && (
        <div
          className="h-[3px] w-full"
          style={{
            background: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`,
          }}
        />
      )}

      <div className="p-3">
        {/* Header - clickable to expand */}
        <div
          className="flex items-start justify-between mb-2 cursor-pointer"
          onClick={onToggleExpand}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              {statusDot(session, theme)}
              <h3
                className="font-mono text-sm font-bold"
                style={{
                  color: session.status === "running" ? theme.primary
                    : session.status === "done" ? theme.tertiary
                      : session.status === "error" ? theme.terminalErr
                        : theme.textSecondary,
                }}
              >
                {session.name}
              </h3>
            </div>
            <p className="text-[11px] font-medium" style={{ color: theme.textMuted }}>
              {session.task}
            </p>
          </div>
          <div className="flex items-start gap-2 flex-shrink-0">
            <div className="text-right">
              {session.elapsed > 0 && (
                <div
                  className="font-mono text-[10px]"
                  style={{
                    color: session.status === "running" ? theme.primary
                      : session.status === "done" ? `${theme.tertiary}b3`
                        : theme.textMuted,
                  }}
                >
                  {formatElapsed(session.elapsed)}
                </div>
              )}
              {totalTasks > 0 && (
                <div className="font-mono text-[9px]" style={{ color: theme.textMuted }}>
                  TASKS: {doneTasks}/{totalTasks}
                </div>
              )}
              {session.id && !session.isMain && session.status === "queued" && (
                <span className="font-mono text-[10px]" style={{ color: theme.textMuted }}>
                  ID: {session.id.slice(0, 4)}
                </span>
              )}
            </div>
            <span
              className="material-symbols-outlined transition-transform duration-200"
              style={{
                color: theme.textMuted,
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                fontSize: "14px",
              }}
            >
              expand_more
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar progress={session.progress} status={session.status} theme={theme} />

        {/* Terminal output */}
        {showTerminal && (
          <TerminalPreview output={session.output} expanded={expanded} theme={theme} />
        )}

        {/* Inline command input */}
        {showInput && (
          <InlineCommandInput
            sessionId={session.id}
            sessionName={session.name}
            onSend={onSendCommand}
            theme={theme}
          />
        )}

        {/* Expanded section */}
        {expanded && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${theme.border}` }}>
            <TodoChips items={session.todoItems} theme={theme} />
            <QuickActions status={session.status} theme={theme} onAction={handleAction} />
          </div>
        )}
      </div>
    </div>
  );
}
