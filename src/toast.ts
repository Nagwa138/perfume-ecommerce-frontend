import { create } from "zustand";

export type ToastType = "success" | "error" | "info";
type Toast = { id: string; message: string; type: ToastType };

type ToastStore = {
  toasts: Toast[];
  add: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
};

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
