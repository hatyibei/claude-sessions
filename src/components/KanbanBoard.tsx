"use client";

import { useMemo } from "react";
import type { Session } from "@/types/session";
import { Column } from "./Column";

interface Props {
  sessions: Session[];
}

export function KanbanBoard({ sessions }: Props) {
  const queued = useMemo(() => sessions.filter((s) => s.status === "queued"), [sessions]);
  const running = useMemo(() => sessions.filter((s) => s.status === "running" || s.status === "error"), [sessions]);
  const done = useMemo(() => sessions.filter((s) => s.status === "done"), [sessions]);

  return (
    <main className="flex-1 overflow-x-auto p-4 flex gap-4 bg-th-surface-lowest">
      <Column title="\u5F85\u6A5F\u4E2D" status="queued" sessions={queued} />
      <Column title="\u5B9F\u884C\u4E2D" status="running" sessions={running} />
      <Column title="\u5B8C\u4E86" status="done" sessions={done} />
    </main>
  );
}
