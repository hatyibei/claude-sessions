"use client";

import { useEffect, useState, useMemo } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import { KanbanBoard } from "@/components/KanbanBoard";
import { GlobalCommandBar } from "@/components/GlobalCommandBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { NotificationToast } from "@/components/NotificationToast";

function useCurrentTime(): string {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      return now.toLocaleTimeString("ja-JP", {
        hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
        timeZoneName: "short",
      });
    };
    setTime(fmt());
    const timer = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
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

  const currentTime = useCurrentTime();

  const { runningCount, queuedCount, doneCount } = useMemo(() => ({
    runningCount: sessions.filter((s) => s.status === "running").length,
    queuedCount: sessions.filter((s) => s.status === "queued").length,
    doneCount: sessions.filter((s) => s.status === "done").length,
  }), [sessions]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-th-bg text-th-text" data-theme={themeMode}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-3 w-full z-30 bg-th-header-bg border-b border-th-header-border">
        <div className="flex items-center gap-6">
          <h1 className="font-mono text-xl font-bold text-th-primary">
            &rsaquo; claude-sessions
          </h1>
          <div className="hidden md:flex items-center gap-4 border-l border-th-border pl-6">
            <span className="font-mono text-[10px] flex items-center gap-2 text-th-text-muted">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-th-primary" />
              {runningCount} RUNNING
            </span>
            <span className="font-mono text-[10px] flex items-center gap-2 text-th-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-th-text-muted" />
              {queuedCount} QUEUED
            </span>
            <span className="font-mono text-[10px] flex items-center gap-2 text-th-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-th-tertiary" />
              {doneCount} DONE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 font-mono text-[11px] text-th-text-muted">
            <span className="px-1.5 py-0.5 rounded bg-th-surface-high border border-th-border text-th-text-secondary">
              &#x2318;K
            </span>
            <span className="px-1.5 py-0.5 rounded bg-th-surface-high border border-th-border text-th-text-secondary">
              &#x2318;/
            </span>
            <div className="w-[1px] h-4 mx-2 bg-th-border" />
            <span
              className={`w-1.5 h-1.5 rounded-full ${wsConnected ? "bg-th-tertiary" : "bg-th-text-muted"}`}
              title={wsConnected ? "WS Connected" : "WS Disconnected (mock mode)"}
            />
            <span className="tracking-widest">{currentTime}</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeSwitcher current={themeMode} onChange={setTheme} />
            <div className="flex items-center gap-3 border-l border-th-border pl-4">
              {["schedule", "terminal", "settings"].map((icon) => (
                <button key={icon} className="material-symbols-outlined transition-colors hover:opacity-80 text-th-text-muted">
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
      />

      <GlobalCommandBar onCreateSession={addSession} />

      <NotificationToast />
    </div>
  );
}
