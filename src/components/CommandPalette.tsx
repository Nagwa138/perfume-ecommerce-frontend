import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowRight } from "lucide-react";
import { useUI } from "../ui";
import { getProducts, type Product } from "../api";

export default function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUI();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
      if (e.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandOpen, setCommandOpen]);

  useEffect(() => {
    if (commandOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQ("");
      setResults([]);
      setFocused(-1);
    }
  }, [commandOpen]);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(() => {
      setLoading(true);
      getProducts({ q: q.trim(), page_size: 6 })
        .then((d) => { setResults(d.items); setFocused(-1); })
        .finally(() => setLoading(false));
    }, 240);
    return () => clearTimeout(t);
  }, [q]);

  const go = (slug: string) => {
    navigate(`/product/${slug}`);
    setCommandOpen(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocused((f) => Math.max(f - 1, -1)); }
    if (e.key === "Enter" && focused >= 0 && results[focused]) go(results[focused].slug);
  };

  if (!commandOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-20 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && setCommandOpen(false)}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search products…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {loading && <span className="text-xs text-muted">Searching…</span>}
          <button onClick={() => setCommandOpen(false)} className="shrink-0 text-muted hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-1">
            {results.map((p, i) => (
              <li key={p.id}>
                <button
                  onClick={() => go(p.slug)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    focused === i ? "bg-surface-2" : "hover:bg-surface-2"
                  }`}
                >
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold text-white/20">A</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted">
                      {p.brand}
                      {p.sale_price != null ? (
                        <> · <span className="text-sale">{(p.sale_price * 50).toLocaleString()} EGP</span></>
                      ) : p.sizes?.[0] ? (
                        <> · {Math.round(p.sizes[0].price * 50).toLocaleString()} EGP</>
                      ) : null}
                    </div>
                  </div>
                  <ArrowRight size={14} className="shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && q.trim() && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted">No results for "{q}"</p>
        )}

        {/* footer hint */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted">
          <span><kbd className="rounded bg-surface-2 px-1 py-0.5 font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="rounded bg-surface-2 px-1 py-0.5 font-mono">↵</kbd> open</span>
          <span><kbd className="rounded bg-surface-2 px-1 py-0.5 font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
