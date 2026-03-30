import { WebSocketServer, WebSocket } from "ws";
import { resolve } from "path";
import { existsSync } from "fs";
import { SessionManager } from "./sessionManager";
import type { SessionEvent, OutputLine, SessionStatus } from "./sessionManager";

const MAX_COMMAND_LENGTH = 4096;

interface ClientMessage {
  type: "subscribe" | "command" | "create" | "action";
  sessionId?: string;
  command?: string;
  task?: string;
  cwd?: string;
  action?: "pause" | "abort" | "start" | "rerun";
}

interface ServerMessage {
  type: "sessions" | "output" | "status" | "notification" | "elapsed";
  sessionId?: string;
  sessions?: unknown[];
  line?: OutputLine;
  status?: SessionStatus;
  progress?: number;
  elapsed?: number;
  message?: string;
}

function validateCwd(cwd: string | undefined): string | undefined {
  if (!cwd) return undefined;
  const resolved = resolve(cwd);
  const home = process.env.HOME || process.env.USERPROFILE || "/";
  if (!resolved.startsWith(home)) return undefined;
  if (!existsSync(resolved)) return undefined;
  return resolved;
}

export function createWSServer(port: number = 3001): {
  wss: WebSocketServer;
  manager: SessionManager;
} {
  const clients = new Set<WebSocket>();

  function broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  const manager = new SessionManager((event: SessionEvent) => {
    switch (event.type) {
      case "output":
        broadcast({
          type: "output",
          sessionId: event.sessionId,
          line: event.data as OutputLine,
        });
        break;
      case "status": {
        const { status, progress } = event.data as {
          status: SessionStatus;
          progress?: number;
        };
        broadcast({ type: "status", sessionId: event.sessionId, status, progress });
        break;
      }
      case "created":
        broadcast({ type: "sessions", sessions: manager.getAllSessions() });
        break;
    }
  });

  // Broadcast elapsed updates every 5 seconds for running sessions
  setInterval(() => {
    const sessions = manager.getAllSessions();
    for (const session of sessions) {
      if (session.status === "running") {
        broadcast({
          type: "elapsed",
          sessionId: session.id,
          elapsed: session.elapsed,
        });
      }
    }
  }, 5000);

  const wss = new WebSocketServer({ port, host: "127.0.0.1" });

  wss.on("connection", (ws) => {
    clients.add(ws);

    // Send current sessions on connect
    const initMsg: ServerMessage = {
      type: "sessions",
      sessions: manager.getAllSessions(),
    };
    ws.send(JSON.stringify(initMsg));

    ws.on("message", (raw) => {
      try {
        const msg: ClientMessage = JSON.parse(raw.toString());

        switch (msg.type) {
          case "create":
            if (msg.task && msg.task.length <= MAX_COMMAND_LENGTH) {
              const safeCwd = validateCwd(msg.cwd);
              const session = manager.createSession(msg.task, safeCwd);
              manager.startSession(session.id);
            }
            break;

          case "command":
            if (
              msg.sessionId &&
              msg.command &&
              msg.command.length <= MAX_COMMAND_LENGTH
            ) {
              manager.sendCommand(msg.sessionId, msg.command);
            }
            break;

          case "action":
            if (msg.sessionId && msg.action) {
              switch (msg.action) {
                case "start":
                  manager.startSession(msg.sessionId);
                  break;
                case "abort":
                  manager.abortSession(msg.sessionId);
                  break;
              }
            }
            break;
        }
      } catch (e) {
        console.error("WS message parse error:", e);
      }
    });

    // Heartbeat
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on("close", () => {
      clients.delete(ws);
      clearInterval(pingInterval);
    });
  });

  console.log(`WebSocket server running on ws://127.0.0.1:${port}`);
  return { wss, manager };
}
