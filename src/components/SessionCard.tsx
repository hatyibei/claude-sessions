"use client";

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
  onAction: (sessionId: string, action: "pause" | "abort" | "start" | "rerun") => void;
  theme: ThemeColors;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
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

export function SessionCard({ session, expanded, onToggleExpand, onSendCommand, onAction, theme }: Props) {
  const isActive = session.status === "running" && session.isMain;
  const showInput = session.status === "running" || session.status === "queued";
  const showTerminal = session.output.length > 0;
  const totalTasks = session.todoItems.length;
  const doneTasks = session.todoItems.filter((t) => t.done).length;

  const cardBorder = isActive
    ? theme.primaryBorder
    : session.status === "done"
      ? withAlpha(theme.tertiary, 0.2)
      : theme.border;

  return (
    <div
      className="rounded-lg transition-all overflow-hidden"
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: cardBorder,
        ...(isActive ? { boxShadow: `0 0 12px ${withAlpha(theme.primary, 0.08)}` } : {}),
      }}
    >
      {isActive && (
        <div
          className="h-[3px] w-full"
          style={{
            background: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`,
          }}
        />
      )}

      <div className="p-3">
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
                      : session.status === "done" ? withAlpha(theme.tertiary, 0.7)
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

        <ProgressBar progress={session.progress} status={session.status} theme={theme} />

        {showTerminal && (
          <TerminalPreview output={session.output} expanded={expanded} theme={theme} />
        )}

        {showInput && (
          <InlineCommandInput
            sessionId={session.id}
            sessionName={session.name}
            onSend={onSendCommand}
            theme={theme}
          />
        )}

        {expanded && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${theme.border}` }}>
            <TodoChips items={session.todoItems} theme={theme} />
            <QuickActions
              status={session.status}
              theme={theme}
              onAction={(action) => onAction(session.id, action)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
