import { X } from "lucide-react";
import { useToast } from "../toast";

export default function Toast() {
  const { toasts, remove } = useToast();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-card backdrop-blur ${
            t.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : t.type === "error"
              ? "border-sale/30 bg-sale/10 text-red-400"
              : "border-border bg-surface text-white"
          }`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
