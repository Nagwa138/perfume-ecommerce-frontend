import { useState, useEffect } from "react";

const THEMES = [
  { id: "emerald", label: "Emerald", accent: "#D9B979", bg: "#0B2B26" },
  { id: "rose",    label: "Rose",    accent: "#D8A18B", bg: "#140A14" },
  { id: "ivory",   label: "Ivory",   accent: "#B8924A", bg: "#FAF5EE" },
] as const;

type ThemeId = typeof THEMES[number]["id"];

export function applyTheme(id: string) {
  document.documentElement.setAttribute("data-theme", id);
  localStorage.setItem("hossam-theme", id);
}

export function initTheme() {
  const saved = localStorage.getItem("hossam-theme") ?? "emerald";
  document.documentElement.setAttribute("data-theme", saved);
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(() =>
    (localStorage.getItem("hossam-theme") as ThemeId) ?? "emerald"
  );
  const [open, setOpen] = useState(false);

  useEffect(() => { applyTheme(theme); }, [theme]);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
      {open && (
        <div
          className="rounded-xl border p-3 shadow-xl backdrop-blur-xl"
          style={{ background: "rgba(0,0,0,0.82)", borderColor: "rgba(255,255,255,0.1)" }}
        >
          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
            Theme
          </p>
          <div className="flex flex-col gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-xs transition-colors"
                style={{
                  background: theme === t.id ? "rgba(255,255,255,0.14)" : "transparent",
                  color: theme === t.id ? "#fff" : "rgba(255,255,255,0.55)",
                }}
              >
                <span
                  className="h-3.5 w-3.5 flex-none rounded-full"
                  style={{ background: t.accent, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)" }}
                />
                {t.label}
                {theme === t.id && (
                  <span className="ml-auto" style={{ color: "rgba(255,255,255,0.35)" }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="Switch theme"
        title="Dev: Switch theme"
        className="flex h-9 w-9 items-center justify-center rounded-full shadow-lg backdrop-blur transition-opacity hover:opacity-100"
        style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.1)", opacity: open ? 1 : 0.6, color: "#fff" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
        </svg>
      </button>
    </div>
  );
}
