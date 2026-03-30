import { watch, type FSWatcher } from "chokidar";
import { readFile, stat, realpath } from "fs/promises";
import { join } from "path";
import { parseTodoMd } from "./todoParser";
import type { TodoItem } from "../types/session";

const DEBOUNCE_MS = 300;
const MAX_FILE_BYTES = 1024 * 1024; // 1MB
const TODO_FILENAME = "todo.md";

export type TodoChangeHandler = (sessionId: string, items: TodoItem[]) => void;

export class FileWatcher {
  private watchers = new Map<string, FSWatcher>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private onChange: TodoChangeHandler;

  constructor(onChange: TodoChangeHandler) {
    this.onChange = onChange;
  }

  watchSession(sessionId: string, cwd: string): void {
    if (this.watchers.has(sessionId)) return;

    const todoPath = join(cwd, TODO_FILENAME);

    const watcher = watch(todoPath, {
      ignoreInitial: false,
      awaitWriteFinish: { stabilityThreshold: 200 },
    });

    // Suppress errors (e.g., ENOENT if parent dir doesn't exist yet)
    watcher.on("error", () => {});

    const handleChange = () => {
      const existing = this.debounceTimers.get(sessionId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(async () => {
        this.debounceTimers.delete(sessionId);

        // Check if still watching (session may have ended during debounce)
        if (!this.watchers.has(sessionId)) return;

        try {
          // Resolve symlinks and verify path stays within home dir
          const realTodoPath = await realpath(todoPath);
          const home = (process.env.HOME ?? "/tmp").replace(/\/$/, "");
          if (!realTodoPath.startsWith(home + "/")) return;

          // Check file size before reading
          const fileStat = await stat(realTodoPath);
          if (fileStat.size > MAX_FILE_BYTES) return;

          const content = await readFile(realTodoPath, "utf-8");
          const items = parseTodoMd(content);
          this.onChange(sessionId, items);
        } catch {
          // File may have been deleted or unreadable
          this.onChange(sessionId, []);
        }
      }, DEBOUNCE_MS);

      this.debounceTimers.set(sessionId, timer);
    };

    watcher.on("add", handleChange);
    watcher.on("change", handleChange);

    this.watchers.set(sessionId, watcher);
  }

  unwatchSession(sessionId: string): void {
    const timer = this.debounceTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(sessionId);
    }

    const watcher = this.watchers.get(sessionId);
    if (watcher) {
      watcher.close();
      this.watchers.delete(sessionId);
    }
  }

  destroy(): void {
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    this.watchers.forEach((watcher) => watcher.close());
    this.watchers.clear();
  }
}
