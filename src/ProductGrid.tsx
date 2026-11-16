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

function SkeletonCard() {
  return <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-surface-2 border border-border/50" />;
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      className="col-span-2 flex flex-col items-center justify-center py-32 text-center md:col-span-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="font-display text-6xl font-bold text-border">0</p>
      <p className="mt-4 text-sm text-muted">Nothing matched your search.</p>
      <button
        onClick={onReset}
        className="mt-6 rounded-full border border-border px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent"
      >
        Clear filters
      </button>
    </motion.div>
  );
}

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

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-6">

        {/* Heading */}
        <div className="py-16 text-center">
          <h2 className="font-display text-4xl font-medium tracking-[0.04em] md:text-5xl lg:text-6xl">
            Shop <span className="italic text-accent">Everything</span>
          </h2>
          <p className="mt-3 text-xs font-medium uppercase tracking-widest text-muted">
            {total > 0 ? `${total} items` : loading ? "Loading…" : "No results"}
          </p>
        </div>

        {/* Sticky toolbar */}
        <div className="sticky top-[72px] z-20 -mx-4 mb-8 border-y border-border/50 bg-bg/85 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6 md:top-[80px]">
          <div className="flex flex-wrap items-center gap-3">

            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={rawQ}
                onChange={(e) => setRawQ(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-text outline-none placeholder:text-muted focus:border-accent transition-colors"
              />
              {rawQ && (
                <button onClick={() => setRawQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Category pills — desktop */}
            <div className="hidden flex-wrap gap-2 md:flex ml-4">
              {["", ...cats].map((c) => (
                <button
                  key={c || "all"}
                  onClick={() => setParam("cat", c || null)}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    cat === c
                      ? "bg-accent text-[color:var(--h-text-inv)] border-transparent shadow-[0_0_16px_rgba(217,185,121,0.3)]"
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
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted md:hidden"
            >
              <SlidersHorizontal size={12} />
              Filters
            </button>

            {/* Sort dropdown */}
            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="cursor-pointer appearance-none rounded-full border border-border bg-transparent py-2 pl-4 pr-9 text-[11px] font-bold uppercase tracking-wider text-text outline-none focus:border-accent transition-colors"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-surface text-text">{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
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
                <div className="flex flex-wrap gap-2 pt-4 pb-2">
                  {["", ...cats].map((c) => (
                    <button
                      key={c || "all"}
                      onClick={() => { setParam("cat", c || null); setFiltersOpen(false); }}
                      className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                        cat === c
                          ? "bg-accent text-[color:var(--h-text-inv)]"
                          : "border border-border text-muted"
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

        {/* Grid — removed the fixed row heights, using natural flow */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6 md:gap-y-12">
          {loading && items.length === 0
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
            : items.length === 0
            ? <EmptyState onReset={resetFilters} />
            : items.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
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

        {/* Load more */}
        {!loading && remaining > 0 && (
          <motion.div
            className="mt-14 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={loadMore}
              className="rounded-full border border-border px-10 py-3.5 text-xs font-bold uppercase tracking-widest text-muted transition-all hover:border-accent hover:bg-accent hover:text-[color:var(--h-text-inv)]"
            >
              Load more ({remaining} left)
            </button>
          </motion.div>
        )}
      </section>

      {/* Quick-view modal */}
      <QuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}