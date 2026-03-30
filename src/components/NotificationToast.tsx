"use client";

import { create } from "zustand";

interface ToastEntry {
  id: string;
  message: string;
}

interface ToastState {
  toasts: ToastEntry[];
  addToast: (message: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
}));

export function showToast(message: string) {
  useToastStore.getState().addToast(message);
}

export function NotificationToast() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="font-mono text-[11px] px-4 py-2 rounded-lg shadow-lg bg-th-surface-high text-th-text border border-th-primary-border"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
