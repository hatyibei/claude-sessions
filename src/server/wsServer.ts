import { WebSocketServer, WebSocket } from "ws";
import { SessionManager } from "./sessionManager";
import type { SessionEvent, OutputLine, SessionStatus } from "./sessionManager";

interface ClientMessage {
  type: "subscribe" | "command" | "create" | "action";
  sessionId?: string;
  command?: string;
  task?: string;
  cwd?: string;
  action?: "pause" | "abort" | "start" | "rerun";
}

interface ServerMessage {
  type: "sessions" | "output" | "status" | "notification";
  sessionId?: string;
  sessions?: unknown[];
  line?: OutputLine;
  status?: SessionStatus;
  progress?: number;
  message?: string;
}

export function createWSServer(port: number = 3001): {
  wss: WebSocketServer;
  manager: SessionManager;
} {
  const clients = new Set<WebSocket>();

  function broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
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

  const wss = new WebSocketServer({ port });

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
            if (msg.task) {
              manager.createSession(msg.task, msg.cwd);
            }
            break;

          case "command":
            if (msg.sessionId && msg.command) {
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

    ws.on("close", () => {
      clients.delete(ws);
    });

    // Heartbeat
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on("close", () => {
      clearInterval(pingInterval);
    });
  });

  console.log(`WebSocket server running on ws://localhost:${port}`);
  return { wss, manager };
}
