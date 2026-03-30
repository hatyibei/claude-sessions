import { create } from "zustand";
import type { Session, SessionStatus, OutputLine, ThemeMode } from "@/types/session";
import { WSClient } from "@/lib/wsClient";

interface SessionState {
  sessions: Session[];
  theme: ThemeMode;
  wsConnected: boolean;
  wsClient: WSClient | null;
  setTheme: (theme: ThemeMode) => void;
  addSession: (name: string, task: string) => void;
  sendCommand: (sessionId: string, command: string) => void;
  updateStatus: (sessionId: string, status: SessionStatus) => void;
  expandedCards: Set<string>;
  toggleExpanded: (sessionId: string) => void;
  initWebSocket: () => void;
  destroyWebSocket: () => void;
}

const now = () => Date.now();

const MOCK_SESSIONS: Session[] = [
  {
    id: "q1",
    name: "docs/api-reference",
    status: "queued",
    isMain: false,
    task: "API\u30EA\u30D5\u30A1\u30EC\u30F3\u30B9\u81EA\u52D5\u751F\u6210",
    elapsed: 0,
    output: [],
    progress: 0,
    todoItems: [],
  },
  {
    id: "q2",
    name: "maintenance/dep-update",
    status: "queued",
    isMain: false,
    task: "\u4F9D\u5B58\u30D1\u30C3\u30B1\u30FC\u30B8\u306E\u4E00\u62EC\u66F4\u65B0",
    elapsed: 0,
    output: [],
    progress: 0,
    todoItems: [],
  },
  {
    id: "r1",
    name: "feature/auth-refactor",
    status: "running",
    isMain: true,
    task: "\u8A8D\u8A3C\u30E2\u30B8\u30E5\u30FC\u30EB\u306E\u30EA\u30D5\u30A1\u30AF\u30BF\u30EA\u30F3\u30B0",
    elapsed: 847,
    output: [
      { t: "cmd", v: "$ claude --dangerously-skip-permissions", ts: now() - 840000 },
      { t: "ok", v: "\u2713 Found 12 files to refactor", ts: now() - 600000 },
      { t: "run", v: "Refactoring src/auth/provider.ts...", ts: now() - 30000 },
      { t: "info", v: "| analizing dependency tree...", ts: now() - 5000 },
    ],
    progress: 45,
    todoItems: [
      { text: "OAuth\u5206\u96E2", done: true },
      { text: "\u578B\u30AC\u30FC\u30C9\u8FFD\u52A0", done: false },
      { text: "\u30C6\u30B9\u30C8\u4FEE\u6B63", done: false },
    ],
    startedAt: now() - 847000,
  },
  {
    id: "r2",
    name: "fix/memory-leak",
    status: "running",
    isMain: false,
    task: "\u30D2\u30FC\u30D7\u30E1\u30E2\u30EA\u4F7F\u7528\u7387\u306E\u8ABF\u67FB",
    elapsed: 164,
    output: [
      { t: "cmd", v: "$ node --inspect src/server.ts", ts: now() - 160000 },
      { t: "run", v: "Profiling heap allocations...", ts: now() - 10000 },
    ],
    progress: 15,
    todoItems: [],
    startedAt: now() - 164000,
  },
  {
    id: "r3",
    name: "test/e2e-suite",
    status: "running",
    isMain: false,
    task: "E2E\u30C6\u30B9\u30C8\u30B9\u30A4\u30FC\u30C8\u5B9F\u884C",
    elapsed: 95,
    output: [
      { t: "cmd", v: "$ pnpm test:e2e", ts: now() - 90000 },
      { t: "ok", v: "\u2713 Login flow passed", ts: now() - 60000 },
      { t: "run", v: "Running checkout flow...", ts: now() - 5000 },
    ],
    progress: 60,
    todoItems: [],
    startedAt: now() - 95000,
  },
  {
    id: "d1",
    name: "feat/dark-mode",
    status: "done",
    isMain: false,
    task: "\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9\u5B9F\u88C5",
    elapsed: 2340,
    output: [
      { t: "ok", v: "\u2713 All tasks completed", ts: now() - 100000 },
      { t: "ok", v: "\u2713 8 files modified", ts: now() - 99000 },
      { t: "ok", v: "\u2713 Tests passing (12/12)", ts: now() - 98000 },
    ],
    progress: 100,
    todoItems: [
      { text: "CSS\u5909\u6570\u5B9A\u7FA9", done: true },
      { text: "\u30C8\u30B0\u30EB\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8", done: true },
      { text: "\u30C6\u30B9\u30C8\u66F4\u65B0", done: true },
    ],
    finishedAt: now() - 98000,
  },
  {
    id: "d2",
    name: "chore/localization",
    status: "done",
    isMain: false,
    task: "i18n\u8A2D\u5B9A\u306E\u521D\u671F\u5316",
    elapsed: 252,
    output: [
      { t: "ok", v: "\u2713 Localization setup complete", ts: now() - 300000 },
    ],
    progress: 100,
    todoItems: [],
    finishedAt: now() - 300000,
  },
];

let nextId = 100;

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: MOCK_SESSIONS,
  theme: "dark" as ThemeMode,
  wsConnected: false,
  wsClient: null,

  setTheme: (theme) => set({ theme }),

  addSession: (name, task) => {
    const { wsClient, wsConnected } = get();

    if (wsConnected && wsClient) {
      wsClient.createSession(task || name);
      return;
    }

    // Fallback: local mock
    const id = `s${nextId++}`;
    const session: Session = {
      id,
      name: name || `session/${id}`,
      status: "queued",
      isMain: false,
      task: task || name,
      elapsed: 0,
      output: [],
      progress: 0,
      todoItems: [],
    };
    set((state) => ({ sessions: [...state.sessions, session] }));
  },

  sendCommand: (sessionId, command) => {
    const { wsClient, wsConnected } = get();

    if (wsConnected && wsClient) {
      wsClient.sendCommand(sessionId, command);
      return;
    }

    // Fallback: local mock
    const line: OutputLine = { t: "user", v: `> ${command}`, ts: Date.now() };
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, output: [...s.output, line] } : s
      ),
    }));
  },

  updateStatus: (sessionId, status) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, status } : s
      ),
    }));
  },

  expandedCards: new Set<string>(["r1"]),

  toggleExpanded: (sessionId) => {
    set((state) => {
      const next = new Set(state.expandedCards);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return { expandedCards: next };
    });
  },

  initWebSocket: () => {
    if (typeof window === "undefined") return;
    if (get().wsClient) return;

    const client = new WSClient("ws://localhost:3001", {
      onSessions: (sessions) => {
        set({ sessions });
      },
      onOutput: (sessionId, line) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, output: [...s.output, line] } : s
          ),
        }));
      },
      onStatus: (sessionId, status, progress) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, status, ...(progress !== undefined ? { progress } : {}) }
              : s
          ),
        }));
      },
      onNotification: () => {
        // Could show toast here
      },
      onConnectionChange: (connected) => {
        set({ wsConnected: connected });
        // When disconnected, revert to mock data
        if (!connected) {
          set({ sessions: MOCK_SESSIONS });
        }
      },
    });

    set({ wsClient: client });
    client.connect();
  },

  destroyWebSocket: () => {
    const { wsClient } = get();
    if (wsClient) {
      wsClient.disconnect();
      set({ wsClient: null, wsConnected: false });
    }
  },
}));
