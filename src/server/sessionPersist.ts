import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { Session } from "../types/session";

const PERSIST_PATH = resolve(process.cwd(), ".claude-sessions-state.json");

interface PersistedState {
  sessions: Array<{
    id: string;
    name: string;
    task: string;
    cwd?: string;
    status: string;
    elapsed: number;
    progress: number;
    startedAt?: number;
    finishedAt?: number;
  }>;
  savedAt: number;
}

export function saveSessionState(sessions: Session[]): void {
  const state: PersistedState = {
    sessions: sessions.map((s) => ({
      id: s.id,
      name: s.name,
      task: s.task,
      cwd: s.cwd,
      status: s.status,
      elapsed: s.elapsed,
      progress: s.progress,
      startedAt: s.startedAt,
      finishedAt: s.finishedAt,
    })),
    savedAt: Date.now(),
  };

  try {
    writeFileSync(PERSIST_PATH, JSON.stringify(state, null, 2));
  } catch {
    // Non-critical - log and continue
    console.error("Failed to persist session state");
  }
}

export function loadSessionState(): PersistedState | null {
  if (!existsSync(PERSIST_PATH)) return null;

  try {
    const raw = readFileSync(PERSIST_PATH, "utf-8");
    const state = JSON.parse(raw) as PersistedState;

    // Don't restore state older than 24 hours
    if (Date.now() - state.savedAt > 24 * 60 * 60 * 1000) return null;

    return state;
  } catch {
    return null;
  }
}

export function clearSessionState(): void {
  try {
    if (existsSync(PERSIST_PATH)) {
      writeFileSync(PERSIST_PATH, JSON.stringify({ sessions: [], savedAt: Date.now() }));
    }
  } catch {
    // ignore
  }
}
