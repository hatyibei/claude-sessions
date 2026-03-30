"use client";

import type { TodoItem } from "@/types/session";

interface Props {
  items: TodoItem[];
}

export function TodoChips({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="font-mono text-[10px] mb-1.5 text-th-text-muted">todo.md</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item.text}
            className={`font-mono text-[10px] px-2 py-0.5 rounded ${
              item.done
                ? "bg-th-tertiary-bg text-th-tertiary line-through opacity-70"
                : "bg-th-primary-bg text-th-primary"
            }`}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
