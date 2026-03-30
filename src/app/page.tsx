"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import { getTheme } from "@/lib/theme";
import { KanbanBoard } from "@/components/KanbanBoard";
import { GlobalCommandBar } from "@/components/GlobalCommandBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { NotificationToast } from "@/components/NotificationToast";

function useCurrentTime(): string {
  const [time, setTime] = useState(() => formatTime());

  useEffect(() => {
    const timer = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
}

function formatTime(): string {
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const abbr = tz.includes("Tokyo") ? "JST" : tz.split("/").pop() || "UTC";
  return now.toLocaleTimeString("ja-JP", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + ` ${abbr}`;
}

export default function Home() {
  const sessions = useSessionStore((s) => s.sessions);
  const themeMode = useSessionStore((s) => s.theme);
  const setTheme = useSessionStore((s) => s.setTheme);
  const addSession = useSessionStore((s) => s.addSession);
  const sendCommand = useSessionStore((s) => s.sendCommand);
  const performAction = useSessionStore((s) => s.performAction);
  const expandedCards = useSessionStore((s) => s.expandedCards);
  const toggleExpanded = useSessionStore((s) => s.toggleExpanded);
  const wsConnected = useSessionStore((s) => s.wsConnected);
  const initWebSocket = useSessionStore((s) => s.initWebSocket);
  const destroyWebSocket = useSessionStore((s) => s.destroyWebSocket);

  useEffect(() => {
    initWebSocket();
    return () => destroyWebSocket();
  }, [initWebSocket, destroyWebSocket]);

  const theme = getTheme(themeMode);
  const currentTime = useCurrentTime();

  const runningCount = sessions.filter((s) => s.status === "running").length;
  const queuedCount = sessions.filter((s) => s.status === "queued").length;
  const doneCount = sessions.filter((s) => s.status === "done").length;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
      data-theme={themeMode}
    >
      <header
        className="flex justify-between items-center px-6 py-3 w-full z-30"
        style={{
          backgroundColor: theme.headerBg,
          borderBottom: `1px solid ${theme.headerBorder}`,
        }}
      >
        <div className="flex items-center gap-6">
          <h1 className="font-mono text-xl font-bold" style={{ color: theme.primary }}>
            &rsaquo; claude-sessions
          </h1>
          <div className="hidden md:flex items-center gap-4 border-l pl-6" style={{ borderColor: theme.border }}>
            <span className="font-mono text-[10px] flex items-center gap-2" style={{ color: theme.textMuted }}>
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: theme.primary }}
              />
              {runningCount} RUNNING
            </span>
            <span className="font-mono text-[10px] flex items-center gap-2" style={{ color: theme.textMuted }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.textMuted }} />
              {queuedCount} QUEUED
            </span>
            <span className="font-mono text-[10px] flex items-center gap-2" style={{ color: theme.textMuted }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.tertiary }} />
              {doneCount} DONE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 font-mono text-[11px]" style={{ color: theme.textMuted }}>
            <span
              className="px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: theme.surfaceHigh,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: theme.border,
                color: theme.textSecondary,
              }}
            >
              &#x2318;K
            </span>
            <span
              className="px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: theme.surfaceHigh,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: theme.border,
                color: theme.textSecondary,
              }}
            >
              &#x2318;/
            </span>
            <div className="w-[1px] h-4 mx-2" style={{ backgroundColor: theme.border }} />
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: wsConnected ? theme.tertiary : theme.textMuted }}
              title={wsConnected ? "WS Connected" : "WS Disconnected (mock mode)"}
            />
            <span className="tracking-widest">{currentTime}</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeSwitcher current={themeMode} onChange={setTheme} theme={theme} />
            <div className="flex items-center gap-3 border-l pl-4" style={{ borderColor: theme.border }}>
              {["schedule", "terminal", "settings"].map((icon) => (
                <button
                  key={icon}
                  className="material-symbols-outlined transition-colors hover:opacity-80"
                  style={{ color: theme.textMuted }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <KanbanBoard
        sessions={sessions}
        expandedCards={expandedCards}
        onToggleExpand={toggleExpanded}
        onSendCommand={sendCommand}
        onAction={performAction}
        theme={theme}
      />

      <GlobalCommandBar onCreateSession={addSession} theme={theme} />

      <NotificationToast theme={theme} />
    </div>
  );
}
