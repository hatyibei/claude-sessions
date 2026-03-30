import type { TodoItem } from "../types/session";

const CHECKLIST_RE = /^\s*-\s*\[([ xX])\]\s+(.+)$/;

export function parseTodoMd(content: string): TodoItem[] {
  const items: TodoItem[] = [];

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(CHECKLIST_RE);
    if (match) {
      items.push({
        text: match[2].trim(),
        done: match[1].toLowerCase() === "x",
      });
    }
  }

  return items;
}
