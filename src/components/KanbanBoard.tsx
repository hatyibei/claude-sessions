"use client";

import { useMemo, useCallback } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Session, SessionStatus } from "@/types/session";
import { useSessionStore } from "@/stores/sessionStore";
import { Column } from "./Column";

interface Props {
  sessions: Session[];
}

export function KanbanBoard({ sessions }: Props) {
  const moveSession = useSessionStore((s) => s.moveSession);

  const queued = useMemo(() => sessions.filter((s) => s.status === "queued"), [sessions]);
  const running = useMemo(() => sessions.filter((s) => s.status === "running" || s.status === "error"), [sessions]);
  const done = useMemo(() => sessions.filter((s) => s.status === "done"), [sessions]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    const sessionId = active.id as string;
    const targetColumn = over.id as SessionStatus;

    if (["queued", "running", "done"].includes(targetColumn)) {
      moveSession(sessionId, targetColumn);
    }
  }, [moveSession]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <main className="flex-1 overflow-x-auto p-4 flex gap-4 bg-th-surface-lowest">
        <Column title="\u5F85\u6A5F\u4E2D" status="queued" sessions={queued} />
        <Column title="\u5B9F\u884C\u4E2D" status="running" sessions={running} />
        <Column title="\u5B8C\u4E86" status="done" sessions={done} />
      </main>
    </DndContext>
  );
}
