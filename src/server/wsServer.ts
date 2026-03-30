import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { resolve } from "path";
import { existsSync } from "fs";
import { SessionManager } from "./sessionManager";
import type { SessionEvent, OutputLine, SessionStatus } from "./sessionManager";

const MAX_COMMAND_LENGTH = 4096;
const MAX_MESSAGES_PER_SECOND = 20;

interface ClientMessage {
  type: "subscribe" | "command" | "create" | "action";
  sessionId?: string;
  command?: string;
  task?: string;
  cwd?: string;
  action?: "abort" | "start";
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

function isValidType(t: unknown): t is ClientMessage["type"] {
  return typeof t === "string" && ["subscribe", "command", "create", "action"].includes(t);
}

function isValidAction(a: unknown): a is ClientMessage["action"] {
  return typeof a === "string" && ["abort", "start"].includes(a);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function isValidSessionId(id: unknown): id is string {
  return typeof id === "string" && (UUID_RE.test(id) || id.startsWith("mock-"));
}

function validateCwd(cwd: string | undefined): string | undefined {
  if (!cwd) return undefined;
  const resolved = resolve(cwd);
  const home = (process.env.HOME ?? "/tmp").replace(/\/$/, "");
  if (!resolved.startsWith(home + "/") && resolved !== home) return undefined;
  if (!existsSync(resolved)) return undefined;
  return resolved;
}

export function createWSServer(
  port: number = 3001,
  authToken?: string,
): {
  wss: WebSocketServer;
  manager: SessionManager;
  cleanup: () => void;
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

  // Broadcast elapsed updates every 5 seconds
  const elapsedInterval = setInterval(() => {
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

  const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  const wss = new WebSocketServer({
    port,
    host: "127.0.0.1",
    verifyClient: ({ req }: { req: IncomingMessage }, cb: (result: boolean, code?: number, message?: string) => void) => {
      // Check auth token
      if (authToken) {
        const url = new URL(req.url ?? "/", "http://127.0.0.1");
        if (url.searchParams.get("token") !== authToken) {
          cb(false, 4401, "Unauthorized");
          return;
        }
      }
      // Check origin
      const origin = req.headers.origin;
      if (origin && !ALLOWED_ORIGINS.includes(origin)) {
        cb(false, 403, "Forbidden");
        return;
      }
      cb(true);
    },
  });

  // Rate limiting state per client
  const clientMsgTimestamps = new WeakMap<WebSocket, number[]>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    clientMsgTimestamps.set(ws, []);

    // Send current sessions on connect
    const initMsg: ServerMessage = {
      type: "sessions",
      sessions: manager.getAllSessions(),
    };
    ws.send(JSON.stringify(initMsg));

    ws.on("message", (raw) => {
      // Rate limiting
      const timestamps = clientMsgTimestamps.get(ws)!;
      const now = Date.now();
      const recent = timestamps.filter((t) => now - t < 1000);
      if (recent.length >= MAX_MESSAGES_PER_SECOND) return;
      recent.push(now);
      clientMsgTimestamps.set(ws, recent);

      try {
        const msg: ClientMessage = JSON.parse(raw.toString());
        if (!isValidType(msg.type)) return;

        switch (msg.type) {
          case "create":
            if (
              msg.task &&
              typeof msg.task === "string" &&
              msg.task.length <= MAX_COMMAND_LENGTH
            ) {
              const safeCwd = validateCwd(msg.cwd);
              const session = manager.createSession(msg.task, safeCwd);
              if (session) {
                manager.startSession(session.id);
              } else {
                ws.send(JSON.stringify({
                  type: "notification",
                  message: "\u30BB\u30C3\u30B7\u30E7\u30F3\u4E0A\u9650\u306B\u9054\u3057\u307E\u3057\u305F",
                }));
              }
            }
            break;

          case "command":
            if (
              isValidSessionId(msg.sessionId) &&
              msg.command &&
              typeof msg.command === "string" &&
              msg.command.length <= MAX_COMMAND_LENGTH
            ) {
              manager.sendCommand(msg.sessionId, msg.command);
            }
            break;

          case "action":
            if (
              isValidSessionId(msg.sessionId) &&
              isValidAction(msg.action)
            ) {
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

  function cleanup() {
    clearInterval(elapsedInterval);
  }

  return { wss, manager, cleanup };
}
