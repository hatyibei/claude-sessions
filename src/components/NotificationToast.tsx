"use client";

import { useToastStore } from "@/stores/toastStore";

export { showToast } from "@/stores/toastStore";

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
