import * as pty from "node-pty";
import stripAnsi from "strip-ansi";
import type {
  SessionStatus,
  OutputLine,
  Session,
  TodoItem,
} from "../types/session";

export type { SessionStatus, OutputLine };

export type SessionEventType = "created" | "output" | "status" | "removed";

export interface SessionEvent {
  type: SessionEventType;
  sessionId: string;
  data: unknown;
}

export type SessionEventHandler = (event: SessionEvent) => void;

interface ManagedSession {
  info: Session;
  pty: pty.IPty | null;
  outputBuffer: OutputLine[];
  elapsedTimer: ReturnType<typeof setInterval> | null;
}

export class SessionManager {
  private sessions = new Map<string, ManagedSession>();
  private nextId = 1;
  private onEvent: SessionEventHandler;

  constructor(onEvent: SessionEventHandler) {
    this.onEvent = onEvent;
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values()).map((m) => ({
      ...m.info,
      output: m.outputBuffer.slice(-50),
    }));
  }

  createSession(task: string, cwd?: string): Session {
    const id = `s${this.nextId++}`;
    const slug = task
      .slice(0, 24)
      .replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    const name = `task/${slug || id}`;

    const info: Session = {
      id,
      name,
      status: "queued",
      isMain: this.sessions.size === 0,
      task,
      elapsed: 0,
      output: [],
      progress: 0,
      todoItems: [],
      cwd: cwd || process.cwd(),
    };

    this.sessions.set(id, {
      info,
      pty: null,
      outputBuffer: [],
      elapsedTimer: null,
    });

    this.onEvent({ type: "created", sessionId: id, data: info });
    return info;
  }

  startSession(id: string): void {
    const managed = this.sessions.get(id);
    if (!managed || managed.pty) return;

    const shell = process.platform === "win32" ? "powershell.exe" : "bash";

    const ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 120,
      rows: 30,
      cwd: managed.info.cwd || process.cwd(),
      env: process.env as Record<string, string>,
    });

    managed.pty = ptyProcess;
    managed.info.status = "running";
    managed.info.startedAt = Date.now();
    managed.info.pid = ptyProcess.pid;

    managed.elapsedTimer = setInterval(() => {
      managed.info.elapsed += 1;
    }, 1000);

    let pendingLines: OutputLine[] = [];
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    const flush = () => {
      for (const line of pendingLines) {
        managed.outputBuffer.push(line);
        this.onEvent({ type: "output", sessionId: id, data: line });
      }
      if (managed.outputBuffer.length > 500) {
        managed.outputBuffer = managed.outputBuffer.slice(-500);
      }
      pendingLines = [];
      flushTimer = null;
    };

    ptyProcess.onData((data) => {
      const cleaned = stripAnsi(data);
      const rawLines = cleaned.split("\n").filter((l) => l.trim().length > 0);

      for (const raw of rawLines) {
        pendingLines.push(this.classifyLine(raw));
      }

      if (!flushTimer) {
        flushTimer = setTimeout(flush, 100);
      }
    });

    ptyProcess.onExit(({ exitCode }) => {
      if (pendingLines.length > 0) flush();
      if (flushTimer) clearTimeout(flushTimer);

      if (managed.elapsedTimer) {
        clearInterval(managed.elapsedTimer);
        managed.elapsedTimer = null;
      }

      managed.info.status = exitCode === 0 ? "done" : "error";
      managed.info.finishedAt = Date.now();
      if (exitCode === 0) managed.info.progress = 100;
      managed.pty = null;

      this.onEvent({
        type: "status",
        sessionId: id,
        data: { status: managed.info.status, progress: managed.info.progress },
      });
    });

    this.onEvent({
      type: "status",
      sessionId: id,
      data: { status: "running" },
    });
  }

  sendCommand(id: string, command: string): void {
    const managed = this.sessions.get(id);
    if (!managed?.pty) return;

    const userLine: OutputLine = { t: "user", v: `> ${command}`, ts: Date.now() };
    managed.outputBuffer.push(userLine);
    this.onEvent({ type: "output", sessionId: id, data: userLine });

    managed.pty.write(command + "\r");
  }

  abortSession(id: string): void {
    const managed = this.sessions.get(id);
    if (!managed) return;

    if (managed.pty) {
      managed.pty.kill();
      managed.pty = null;
    }

    if (managed.elapsedTimer) {
      clearInterval(managed.elapsedTimer);
      managed.elapsedTimer = null;
    }

    managed.info.status = "error";
    managed.info.finishedAt = Date.now();

    const errLine: OutputLine = { t: "err", v: "\u2715 Aborted by user", ts: Date.now() };
    managed.outputBuffer.push(errLine);

    this.onEvent({ type: "output", sessionId: id, data: errLine });
    this.onEvent({
      type: "status",
      sessionId: id,
      data: { status: "error", progress: managed.info.progress },
    });
  }

  private classifyLine(line: string): OutputLine {
    const trimmed = line.trim();
    const ts = Date.now();

    if (trimmed.startsWith("$") || trimmed.startsWith("\u276F")) {
      return { t: "cmd", v: trimmed, ts };
    }
    if (trimmed.startsWith("\u2713") || trimmed.startsWith("\u2714")) {
      return { t: "ok", v: trimmed, ts };
    }
    if (
      trimmed.startsWith("\u2715") ||
      trimmed.startsWith("\u2717") ||
      trimmed.toLowerCase().startsWith("error")
    ) {
      return { t: "err", v: trimmed, ts };
    }
    if (
      trimmed.startsWith("\u280B") ||
      trimmed.startsWith("\u2819") ||
      trimmed.startsWith("\u2838") ||
      trimmed.includes("...")
    ) {
      return { t: "run", v: trimmed, ts };
    }
    if (trimmed.startsWith("\u2192") || trimmed.startsWith("|")) {
      return { t: "info", v: trimmed, ts };
    }

    return { t: "info", v: trimmed, ts };
  }

  destroy(): void {
    this.sessions.forEach((managed) => {
      if (managed.elapsedTimer) clearInterval(managed.elapsedTimer);
      managed.pty?.kill();
    });
    this.sessions.clear();
  }
}
