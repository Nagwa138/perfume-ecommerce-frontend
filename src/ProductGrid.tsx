import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { getProducts, type Product } from "./api";
import ProductCard from "./ProductCard";
import QuickView from "./QuickView";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "popular",    label: "Featured"           },
  { value: "newest",     label: "Newest"              },
  { value: "price_asc",  label: "Price: Low → High"  },
  { value: "price_desc", label: "Price: High → Low"  },
] as const;

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div className={`animate-pulse rounded-xl bg-surface-2 ${featured ? "col-span-2 row-span-2" : ""}`} />
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      className="col-span-2 flex flex-col items-center justify-center py-28 text-center md:col-span-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="font-display text-5xl font-bold text-white/10">0</p>
      <p className="mt-3 text-muted">Nothing matched your search.</p>
      <button
        onClick={onReset}
        className="mt-5 rounded-full border border-border px-5 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
      >
        Clear filters
      </button>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductGrid() {
  const [sp, setSp] = useSearchParams();

  const cat  = sp.get("cat")  ?? "";
  const q    = sp.get("q")    ?? "";
  const sort = sp.get("sort") ?? "popular";

  const [rawQ, setRawQ] = useState(q);
  const [cats, setCats] = useState<string[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { setCats([]); }, []);

  // Sync debounced search input → URL
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp);
      if (rawQ) next.set("q", rawQ); else next.delete("q");
      next.delete("page");
      setSp(next, { replace: true });
    }, 320);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQ]);

  // When URL filter params change → reset & fetch page 1
  useEffect(() => {
    setPage(1);
    setLoading(true);
    getProducts({ q: q || undefined, sort, page: 1, page_size: PAGE_SIZE })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        setLoading(false);
      });
  // cat/q/sort come from URL — exhaustive-deps not needed here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, q, sort]);

  const loadMore = useCallback(() => {
    const next = page + 1;
    setPage(next);
    setLoading(true);
    getProducts({ q: q || undefined, sort, page: next, page_size: PAGE_SIZE })
      .then((data) => {
        setItems((prev) => [...prev, ...data.items]);
        setTotal(data.total);
        setLoading(false);
      });
  }, [page, cat, q, sort]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value); else next.delete(key);
    setSp(next, { replace: true });
  };

  const resetFilters = () => {
    setRawQ("");
    setSp(new URLSearchParams(), { replace: true });
  };

  const remaining = total - items.length;

  // Build the display list (skeleton slots or real cards)
  const skeletonCount = PAGE_SIZE;

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-6">

        {/* ── Heading ── */}
        <div className="py-14 text-center">
          <h2 className="font-display text-5xl font-bold uppercase tracking-tight md:text-6xl">
            Shop{" "}
            <span
              className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"
            >
              everything
            </span>
          </h2>
          <p className="mt-2 text-sm text-muted">
            {total > 0 ? `${total} items` : loading ? "Loading…" : "No results"}
          </p>
        </div>

        {/* ── Sticky toolbar ── */}
        <div className="sticky top-14 z-20 -mx-4 mb-6 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-md md:-mx-6 md:px-6">
          <div className="flex flex-wrap items-center gap-3">

            {/* Search */}
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={rawQ}
                onChange={(e) => setRawQ(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-full border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-white outline-none placeholder:text-muted focus:border-accent"
              />
              {rawQ && (
                <button
                  onClick={() => setRawQ("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Category pills — desktop */}
            <div className="hidden flex-wrap gap-1.5 md:flex">
              {["", ...cats].map((c) => (
                <button
                  key={c || "all"}
                  onClick={() => setParam("cat", c || null)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    cat === c
                      ? "bg-accent text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                      : "border border-border text-muted hover:border-white/40 hover:text-white"
                  }`}
                >
                  {c || "All"}
                </button>
              ))}
            </div>

            {/* Mobile filters toggle */}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted md:hidden"
            >
              <SlidersHorizontal size={12} />
              Filters
            </button>

            {/* Sort dropdown */}
            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="cursor-pointer appearance-none rounded-full border border-border bg-surface py-1.5 pl-3.5 pr-7 text-xs font-medium text-white outline-none focus:border-accent"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>

          {/* Mobile category pills (collapsible) */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {["", ...cats].map((c) => (
                    <button
                      key={c || "all"}
                      onClick={() => { setParam("cat", c || null); setFiltersOpen(false); }}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        cat === c
                          ? "bg-accent text-white"
                          : "border border-border text-muted hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {c || "All"}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Grid ── */}
        <div
          className="grid grid-cols-2 gap-3 [grid-auto-rows:260px] [grid-auto-flow:row_dense] md:grid-cols-4 md:gap-4 md:[grid-auto-rows:300px]"
        >
          {loading && items.length === 0
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <SkeletonCard key={i} featured={i % 7 === 6} />
              ))
            : items.length === 0
            ? <EmptyState onReset={resetFilters} />
            : items.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  featured={i % 7 === 6}
                  index={i}
                  onQuickView={setQuickViewProduct}
                />
              ))
          }

          {/* Skeleton for load-more in progress */}
          {loading && items.length > 0 &&
            Array.from({ length: Math.min(remaining, PAGE_SIZE) }).map((_, i) => (
              <SkeletonCard key={`more-${i}`} />
            ))
          }
        </div>

        {/* ── Load more ── */}
        {!loading && remaining > 0 && (
          <motion.div
            className="mt-10 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={loadMore}
              className="rounded-full border border-border px-8 py-3 text-sm font-semibold text-muted transition-all hover:border-accent hover:bg-accent hover:text-white"
            >
              Load more ({remaining} left)
            </button>
          </motion.div>
        )}
      </section>

      {/* ── Quick-view modal ── */}
      <QuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}
