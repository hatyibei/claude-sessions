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
