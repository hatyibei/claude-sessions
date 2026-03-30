"use client";

import type { TodoItem } from "@/types/session";
import type { ThemeColors } from "@/lib/theme";

interface Props {
  items: TodoItem[];
  theme: ThemeColors;
}

export function TodoChips({ items, theme }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="font-mono text-[10px] mb-1.5" style={{ color: theme.textMuted }}>
        todo.md
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="font-mono text-[10px] px-2 py-0.5 rounded"
            style={{
              backgroundColor: item.done ? theme.tertiaryBg : theme.primaryBg,
              color: item.done ? theme.tertiary : theme.primary,
              textDecoration: item.done ? "line-through" : "none",
              opacity: item.done ? 0.7 : 1,
            }}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
