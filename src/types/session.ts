export type SessionStatus = "queued" | "running" | "done" | "error";

export type ThemeMode = "dark" | "light" | "beige";

export interface OutputLine {
  t: "cmd" | "ok" | "run" | "info" | "err" | "wait" | "user";
  v: string;
  ts: number;
}

export interface TodoItem {
  text: string;
  done: boolean;
}

export interface Session {
  id: string;
  name: string;
  status: SessionStatus;
  isMain: boolean;
  task: string;
  elapsed: number;
  output: OutputLine[];
  progress: number;
  todoItems: TodoItem[];
  pid?: number;
  cwd?: string;
  startedAt?: number;
  finishedAt?: number;
}
