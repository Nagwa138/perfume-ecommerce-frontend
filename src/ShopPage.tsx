import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, Search, SlidersHorizontal, X,
} from "lucide-react";
import { getProducts, fmtEGP, type Facets, type Product } from "./api";
import ProductCard from "./ProductCard";
import QuickView from "./QuickView";
import { useTitle } from "./hooks/useTitle";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "popular",    label: "Featured"          },
  { value: "newest",     label: "Newest"             },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating",     label: "Top Rated"          },
] as const;

const FIT_OPTIONS  = ["slim", "regular", "relaxed", "oversized"];
const SIZE_ORDER   = ["XS", "S", "M", "L", "XL", "XXL", "One Size",
                      "UK6", "UK7", "UK8", "UK9", "UK10", "UK11"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortedSizes(sizes: Record<string, number>): string[] {
  const ordered = SIZE_ORDER.filter((s) => s in sizes);
  const extra   = Object.keys(sizes).filter((s) => !SIZE_ORDER.includes(s)).sort();
  return [...ordered, ...extra];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return <div className="animate-pulse rounded-xl bg-surface-2 aspect-[3/4]" />;
}

function FilterSection({
  title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-widest text-muted hover:text-white"
      >
        {title}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Active-filter chips ───────────────────────────────────────────────────────

type ActiveChip = { label: string; key: string };

function ActiveFilters({
  chips, onRemove, onClear,
}: { chips: ActiveChip[]; onRemove: (key: string) => void; onClear: () => void }) {
  if (chips.length === 0) return null;
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={() => onRemove(c.key)}
          className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/20"
        >
          {c.label}
          <X size={10} />
        </button>
      ))}
      <button
        onClick={onClear}
        className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted transition-colors hover:border-white/40 hover:text-white"
      >
        Clear all
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const [sp, setSp] = useSearchParams();
  useTitle("Shop");

  // ── Read URL params ────────────────────────────────────────────────────────
  const dep    = sp.get("department")  ?? "";
  const cat    = sp.get("category")    ?? "";
  const subcat = sp.get("subcategory") ?? "";
  const fit    = sp.get("fit")         ?? "";
  const size   = sp.get("size")        ?? "";
  const sort   = sp.get("sort")        ?? "newest";
  const onSale = sp.get("on_sale")     === "true";
  const inStock = sp.get("in_stock")   === "true";
  const rawQ   = sp.get("q")           ?? "";
  const minP   = sp.get("min_price") ? Number(sp.get("min_price")) : undefined;
  const maxP   = sp.get("max_price") ? Number(sp.get("max_price")) : undefined;
  const page   = Number(sp.get("page") ?? 1);

  // ── State ──────────────────────────────────────────────────────────────────
  const [items,    setItems]    = useState<Product[]>([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [facets,   setFacets]   = useState<Facets | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [qInput,   setQInput]   = useState(rawQ);
  const [sideOpen, setSideOpen] = useState(false);
  const [qv,       setQv]       = useState<Product | null>(null);

  // Price slider local state (not committed to URL until user releases)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999]);
  const priceInitRef = useRef(false);

  // ── Set param helper ───────────────────────────────────────────────────────
  const setParam = useCallback((key: string, value: string | null) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      next.delete("page"); // reset pagination on filter change
      return next;
    }, { replace: true });
  }, [setSp]);

  const setPage = (p: number) =>
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      if (p > 1) next.set("page", String(p)); else next.delete("page");
      return next;
    }, { replace: true });

  const clearAll = () => setSp(new URLSearchParams(), { replace: true });

  // ── Search debounce ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setSp((prev) => {
        const next = new URLSearchParams(prev);
        if (qInput) next.set("q", qInput); else next.delete("q");
        next.delete("page");
        return next;
      }, { replace: true });
    }, 320);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    getProducts({
      department:  dep    || undefined,
      category:    cat    || undefined,
      subcategory: subcat || undefined,
      fit:         fit    || undefined,
      size:        size   || undefined,
      q:           rawQ   || undefined,
      sort,
      on_sale:  onSale   || undefined,
      in_stock: inStock  || undefined,
      min_price: minP,
      max_price: maxP,
      page, page_size: PAGE_SIZE,
    }).then((data) => {
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setFacets(data.facets);
      if (!priceInitRef.current && data.facets.price_range.max > 0) {
        setPriceRange([data.facets.price_range.min, data.facets.price_range.max]);
        priceInitRef.current = true;
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, cat, subcat, fit, size, rawQ, sort, onSale, inStock, minP, maxP, page]);

  // ── Active filter chips ────────────────────────────────────────────────────
  const chips: ActiveChip[] = [
    dep    && { label: dep,     key: "department"  },
    cat    && { label: cat,     key: "category"    },
    subcat && { label: subcat,  key: "subcategory" },
    fit    && { label: fit,     key: "fit"         },
    size   && { label: size,    key: "size"        },
    onSale  && { label: "Sale", key: "on_sale"     },
    inStock && { label: "In Stock", key: "in_stock" },
    rawQ   && { label: `"${rawQ}"`, key: "q"       },
  ].filter(Boolean) as ActiveChip[];

  // ── Sidebar content ────────────────────────────────────────────────────────
  const sidebarContent = (
    <div className="text-sm">

      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-full border border-border bg-surface py-2 pl-8 pr-3 text-sm text-white outline-none placeholder:text-muted focus:border-accent"
        />
      </div>

      {/* Department */}
      <FilterSection title="Department">
        <div className="flex flex-col gap-1.5">
          {["Men", "Women", "Kids"].map((d) => (
            <button
              key={d}
              onClick={() => setParam("department", dep === d ? null : d)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                dep === d
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-white"
              }`}
            >
              {dep === d && <ChevronRight size={12} className="shrink-0" />}
              {d}
              {facets?.departments[d] != null && (
                <span className="ml-auto text-xs text-muted/60">
                  {facets.departments[d]}
                </span>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      {facets && Object.keys(facets.categories).length > 0 && (
        <FilterSection title="Category">
          <div className="flex flex-col gap-1">
            {Object.entries(facets.categories)
              .sort(([, a], [, b]) => b - a)
              .map(([c, count]) => (
                <button
                  key={c}
                  onClick={() => {
                    if (cat === c) { setParam("category", null); setParam("subcategory", null); }
                    else { setParam("category", c); setParam("subcategory", null); }
                  }}
                  className={`flex items-center rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    cat === c
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-surface-2 hover:text-white"
                  }`}
                >
                  {c}
                  <span className="ml-auto text-xs text-muted/60">{count}</span>
                </button>
              ))}
          </div>
        </FilterSection>
      )}

      {/* Subcategory */}
      {cat && facets && Object.keys(facets.subcategories).length > 0 && (
        <FilterSection title="Style">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(facets.subcategories)
              .sort(([, a], [, b]) => b - a)
              .map(([sc, count]) => (
                <button
                  key={sc}
                  onClick={() => setParam("subcategory", subcat === sc ? null : sc)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                    subcat === sc
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border text-muted hover:border-white/40 hover:text-white"
                  }`}
                >
                  {sc} <span className="opacity-50">{count}</span>
                </button>
              ))}
          </div>
        </FilterSection>
      )}

      {/* Fit */}
      {facets && Object.keys(facets.fits).length > 0 && (
        <FilterSection title="Fit" defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5">
            {FIT_OPTIONS.filter((f) => f in (facets?.fits ?? {})).map((f) => (
              <button
                key={f}
                onClick={() => setParam("fit", fit === f ? null : f)}
                className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all ${
                  fit === f
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-muted hover:border-white/40 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Size */}
      {facets && Object.keys(facets.sizes).length > 0 && (
        <FilterSection title="Size" defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5">
            {sortedSizes(facets.sizes).map((s) => (
              <button
                key={s}
                onClick={() => setParam("size", size === s ? null : s)}
                className={`min-w-[2.5rem] rounded-md border px-2.5 py-1.5 text-center text-xs font-semibold transition-all ${
                  size === s
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-muted hover:border-white/40 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price */}
      {facets && facets.price_range.max > 0 && (
        <FilterSection title="Price" defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-muted">
              <span>{fmtEGP(priceRange[0])}</span>
              <span>{fmtEGP(priceRange[1])}</span>
            </div>
            <input
              type="range"
              min={facets.price_range.min}
              max={facets.price_range.max}
              step={1}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              onMouseUp={() => setParam("max_price", String(priceRange[1]))}
              onTouchEnd={() => setParam("max_price", String(priceRange[1]))}
              className="w-full accent-accent"
            />
          </div>
        </FilterSection>
      )}

      {/* Toggles */}
      <FilterSection title="Availability" defaultOpen={false}>
        <div className="space-y-2">
          {([
            ["On Sale",  "on_sale",  onSale ],
            ["In Stock", "in_stock", inStock],
          ] as const).map(([label, key, active]) => (
            <button
              key={key}
              onClick={() => setParam(key, active ? null : "true")}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-white"
              }`}
            >
              <span className={`h-3 w-3 shrink-0 rounded-sm border transition-colors ${
                active ? "border-accent bg-accent" : "border-border"
              }`} />
              {label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  const heading = cat ? `${dep ? dep + " — " : ""}${cat}` : dep || "All Products";

  return (
    <>
      {/* ── Page heading ───────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-surface/50 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          {dep && !cat ? dep : cat ? `${dep} › ${cat}` : "Shop"}
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {heading}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {loading ? "Loading…" : `${total} item${total === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="mx-auto flex max-w-7xl gap-0 px-4 pb-24 md:gap-8 md:px-6">

        {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 pt-8 md:block lg:w-64">
          {sidebarContent}
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1 pt-6">

          {/* Toolbar: mobile filter toggle + sort */}
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => setSideOpen(true)}
              className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-white/40 hover:text-white md:hidden"
            >
              <SlidersHorizontal size={13} />
              Filters {chips.length > 0 && `(${chips.length})`}
            </button>

            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="cursor-pointer appearance-none rounded-full border border-border bg-surface py-2 pl-4 pr-8 text-xs font-medium text-white outline-none focus:border-accent"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>

          {/* Active filter chips */}
          <ActiveFilters
            chips={chips}
            onRemove={(key) => setParam(key, null)}
            onClear={clearAll}
          />

          {/* Product grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading && items.length === 0
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
              : items.length === 0
              ? (
                <div className="col-span-full flex flex-col items-center py-28 text-center">
                  <p className="font-display text-5xl font-bold text-white/10">0</p>
                  <p className="mt-3 text-muted">No products matched your filters.</p>
                  <button
                    onClick={clearAll}
                    className="mt-5 rounded-full border border-border px-5 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    Clear filters
                  </button>
                </div>
              )
              : items.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  onQuickView={setQv}
                />
              ))
            }
          </div>

          {/* Pagination */}
          {!loading && pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="text-sm text-muted">
                {page} / {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile sidebar drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {sideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setSideOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-full overflow-y-auto bg-bg px-5 py-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Filters</h2>
                <button
                  onClick={() => setSideOpen(false)}
                  className="text-muted hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              {sidebarContent}
              <button
                onClick={() => setSideOpen(false)}
                className="mt-6 w-full rounded-full bg-accent py-3 text-sm font-bold text-white"
              >
                Show {total} results
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Quick-view ─────────────────────────────────────────────────────── */}
      <QuickView product={qv} onClose={() => setQv(null)} />
    </>
  );
}
