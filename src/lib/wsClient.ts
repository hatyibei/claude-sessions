import type { Session, OutputLine, SessionStatus } from "@/types/session";

export interface WSHandlers {
  onSessions: (sessions: Session[]) => void;
  onOutput: (sessionId: string, line: OutputLine) => void;
  onStatus: (sessionId: string, status: SessionStatus, progress?: number) => void;
  onElapsed: (sessionId: string, elapsed: number) => void;
  onNotification: (message: string) => void;
  onConnectionChange: (connected: boolean) => void;
}

export class WSClient {
  private ws: WebSocket | null = null;
  private handlers: WSHandlers;
  private url: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private shouldReconnect = true;

  constructor(url: string, handlers: WSHandlers) {
    this.url = url;
    this.handlers = handlers;
  }

  connect(): void {
    if (typeof window === "undefined") return;

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectDelay = 1000;
      this.handlers.onConnectionChange(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "sessions":
            this.handlers.onSessions(msg.sessions);
            break;
          case "output":
            this.handlers.onOutput(msg.sessionId, msg.line);
            break;
          case "status":
            this.handlers.onStatus(msg.sessionId, msg.status, msg.progress);
            break;
          case "elapsed":
            this.handlers.onElapsed(msg.sessionId, msg.elapsed);
            break;
          case "notification":
            this.handlers.onNotification(msg.message);
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    this.ws.onclose = () => {
      this.handlers.onConnectionChange(false);
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    const delay = this.reconnectDelay;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  send(msg: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  createSession(task: string, cwd?: string): void {
    this.send({ type: "create", task, cwd });
  }

  sendCommand(sessionId: string, command: string): void {
    this.send({ type: "command", sessionId, command });
  }

  performAction(sessionId: string, action: string): void {
    this.send({ type: "action", sessionId, action });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }
}
