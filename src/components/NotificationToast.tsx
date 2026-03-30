"use client";

import { useState, useEffect, useCallback } from "react";
import type { ThemeColors } from "@/lib/theme";

interface Toast {
  id: string;
  message: string;
}

let addToastFn: ((message: string) => void) | null = null;

export function showToast(message: string) {
  addToastFn?.(message);
}

export function NotificationToast({ theme }: { theme: ThemeColors }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="font-mono text-[11px] px-4 py-2 rounded-lg shadow-lg animate-[fadeIn_0.2s_ease-out]"
          style={{
            backgroundColor: theme.surfaceHigh,
            color: theme.text,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: theme.primaryBorder,
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
