import { readFileSync, existsSync } from "fs";

export interface TodoItem {
  text: string;
  done: boolean;
}

export function parseTodoMd(filePath: string): TodoItem[] {
  if (!existsSync(filePath)) return [];

  try {
    const content = readFileSync(filePath, "utf-8");
    return parseTodoContent(content);
  } catch {
    return [];
  }
}

export function parseTodoContent(content: string): TodoItem[] {
  const items: TodoItem[] = [];

  for (const line of content.split("\n")) {
    const match = line.match(/^[-*]\s*\[([ xX])\]\s+(.+)$/);
    if (match) {
      items.push({
        text: match[2].trim(),
        done: match[1].toLowerCase() === "x",
      });
    }
  }

  return items;
}

export function calculateProgress(items: TodoItem[]): number {
  if (items.length === 0) return 0;
  const done = items.filter((i) => i.done).length;
  return Math.round((done / items.length) * 100);
}
