import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { getProducts, fmtEGP, type Facets, type Product } from "./api";
import { BRAND } from "./brand";
import ProductCard from "./ProductCard";
import QuickView from "./QuickView";
import { useTitle } from "./hooks/useTitle";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "popular",    label: "Featured" },
  { value: "newest",     label: "Newest" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating",     label: "Top Rated" },
] as const;

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  perfume:  "Fragrance",
  skincare: "Skincare",
  makeup:   "Makeup",
  haircare: "Hair",
  body:     "Body",
  "pharmacy-wellness": "Pharmacy & Wellness",
};

function SkeletonCard() {
  return <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-surface-2 border border-border/50" />;
}

function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left text-[10px] font-bold uppercase tracking-widest text-text transition-colors hover:text-accent"
      >
        {title}
        <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Chip = { label: string; key: string };

function ActiveFilters({ chips, onRemove, onClear }: {
  chips: Chip[]; onRemove: (k: string) => void; onClear: () => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={() => onRemove(c.key)}
          className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent/20"
        >
          {c.label} <X size={10} />
        </button>
      ))}
      <button
        onClick={onClear}
        className="rounded-full border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted transition-colors hover:border-text/40 hover:text-text"
      >
        Clear all
      </button>
    </div>
  );
}

function ChipFilter({
  options, active, onChange,
}: { options: Record<string, number>; active: string; onChange: (v: string | null) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(options).sort(([, a], [, b]) => b - a).map(([v, count]) => (
        <button
          key={v}
          onClick={() => onChange(active === v ? null : v)}
          className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
            active === v
              ? "border-accent bg-accent/15 text-accent"
              : "border-border text-muted hover:border-text/40 hover:text-text"
          }`}
        >
          {v} <span className="opacity-50 ml-1">{count}</span>
        </button>
      ))}
    </div>
  );
}

// Editorial Break Component
function EditorialBreak({ index }: { index: number }) {
  return (
    <div className="col-span-full my-8 rounded-2xl border border-border bg-surface-2 p-8 md:p-12 text-center relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none" />
      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">The Edit</p>
        <h3 className="mt-2 font-display text-3xl font-medium tracking-wide">
          {index === 0 ? "A Scent for Every Mood" : "Elevate Your Daily Ritual"}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Discover our curated selection of luxury beauty essentials, designed to transform the ordinary into the extraordinary.
        </p>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [sp, setSp] = useSearchParams();
  useTitle("Shop");

  const ptType  = sp.get("product_type") ?? "";
  const subcat  = sp.get("subcategory")  ?? "";
  const gender  = sp.get("gender")       ?? "";
  const family  = sp.get("family")       ?? "";
  const conc    = sp.get("concentration")?? "";
  const note    = sp.get("note")         ?? "";
  const season  = sp.get("season")       ?? "";
  const occ     = sp.get("occasion")     ?? "";
  const skType  = sp.get("skin_type")    ?? "";
  const sort    = sp.get("sort")         ?? "newest";
  const onSale  = sp.get("on_sale")      === "true";
  const inStock = sp.get("in_stock")     === "true";
  const rawQ    = sp.get("q")            ?? "";
  const minP    = sp.get("min_price") ? Number(sp.get("min_price")) : undefined;
  const maxP    = sp.get("max_price") ? Number(sp.get("max_price")) : undefined;
  const page    = Number(sp.get("page") ?? 1);

  const [items,    setItems]    = useState<Product[]>([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [facets,   setFacets]   = useState<Facets | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [qInput,   setQInput]   = useState(rawQ);
  const [sideOpen, setSideOpen] = useState(false);
  const [qv,       setQv]       = useState<Product | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999]);
  const priceInitRef = useRef(false);

  const setParam = useCallback((key: string, value: string | null) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      next.delete("page");
      return next;
    }, { replace: true });
  }, [setSp]);

  const setPageNum = (p: number) =>
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      if (p > 1) next.set("page", String(p)); else next.delete("page");
      return next;
    }, { replace: true });

  const clearAll = () => setSp(new URLSearchParams(), { replace: true });

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

  useEffect(() => {
    setLoading(true);
    getProducts({
      product_type: ptType  || undefined,
      subcategory:  subcat  || undefined,
      gender:       gender  || undefined,
      family:       family  || undefined,
      concentration: conc   || undefined,
      note:         note    || undefined,
      season:       season  || undefined,
      occasion:     occ     || undefined,
      skin_type:    skType  || undefined,
      q:            rawQ    || undefined,
      sort,
      on_sale:   onSale  || undefined,
      in_stock:  inStock || undefined,
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
  }, [ptType, subcat, gender, family, conc, note, season, occ, skType, rawQ, sort, onSale, inStock, minP, maxP, page]);

  const chips: Chip[] = [
    ptType  && { label: PRODUCT_TYPE_LABELS[ptType] ?? ptType, key: "product_type" },
    subcat  && { label: subcat,  key: "subcategory" },
    gender  && { label: gender,  key: "gender" },
    family  && { label: family,  key: "family" },
    conc    && { label: conc,    key: "concentration" },
    note    && { label: note,    key: "note" },
    season  && { label: season,  key: "season" },
    occ     && { label: occ,     key: "occasion" },
    skType  && { label: skType,  key: "skin_type" },
    onSale  && { label: "Sale",     key: "on_sale" },
    inStock && { label: "In Stock", key: "in_stock" },
    rawQ    && { label: `"${rawQ}"`, key: "q" },
  ].filter(Boolean) as Chip[];

  const isFragrance = !ptType || ptType === "perfume";
  const isCosmetic  = ["skincare", "body"].includes(ptType);
  const isMakeup    = ptType === "makeup";

  const heading = ptType
    ? (PRODUCT_TYPE_LABELS[ptType] ?? ptType)
    : subcat || "All Beauty";

  const sidebarContent = (
    <div className="text-sm">
      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-full border border-border bg-transparent py-2 pl-8 pr-3 text-sm text-text outline-none placeholder:text-muted focus:border-accent transition-colors"
        />
      </div>

      {/* Product type */}
      <FilterSection title="Category">
        <div className="flex flex-col gap-1">
          {Object.entries(PRODUCT_TYPE_LABELS).map(([pt, label]) => (
            <button
              key={pt}
              onClick={() => { setParam("product_type", ptType === pt ? null : pt); setParam("subcategory", null); }}
              className={`flex items-center rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                ptType === pt
                  ? "bg-accent/15 text-accent font-bold"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              {label}
              {facets?.product_types[pt] != null && (
                <span className="ml-auto text-[10px] text-muted/60">{facets.product_types[pt]}</span>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Subcategory */}
      {facets && Object.keys(facets.subcategories).length > 0 && (
        <FilterSection title="Subcategory">
          <ChipFilter
            options={facets.subcategories}
            active={subcat}
            onChange={(v) => setParam("subcategory", v)}
          />
        </FilterSection>
      )}

      {/* Fragrance-specific */}
      {(isFragrance || !ptType) && facets && Object.keys(facets.genders).length > 0 && (
        <FilterSection title="Gender" defaultOpen={false}>
          <ChipFilter options={facets.genders} active={gender} onChange={(v) => setParam("gender", v)} />
        </FilterSection>
      )}

      {(isFragrance || !ptType) && facets && Object.keys(facets.families).length > 0 && (
        <FilterSection title="Fragrance Family" defaultOpen={false}>
          <ChipFilter options={facets.families} active={family} onChange={(v) => setParam("family", v)} />
        </FilterSection>
      )}

      {/* Skin type */}
      {(isCosmetic || isMakeup || !ptType) && facets && Object.keys(facets.skin_types).length > 0 && (
        <FilterSection title="Skin Type" defaultOpen={false}>
          <ChipFilter options={facets.skin_types} active={skType} onChange={(v) => setParam("skin_type", v)} />
        </FilterSection>
      )}

      {/* Price */}
      {facets && facets.price_range.max > 0 && (
        <FilterSection title="Price" defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] text-muted">
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

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <div className="space-y-2">
          {([
            ["On Sale",  "on_sale",  onSale ],
            ["In Stock", "in_stock", inStock],
          ] as const).map(([label, key, active]) => (
            <button
              key={key}
              onClick={() => setParam(key, active ? null : "true")}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                active ? "bg-accent/10 text-accent font-bold" : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <span className={`h-3 w-3 shrink-0 rounded-sm border transition-colors ${active ? "border-accent bg-accent" : "border-border"}`} />
              {label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Category Banner */}
      <div className="relative overflow-hidden border-b border-border bg-surface py-16 text-center">
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="relative z-10 px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
            {ptType ? `${BRAND.name} Beauty` : "Shop"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-wide sm:text-5xl md:text-6xl text-text">
            {heading}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {loading ? "Loading…" : `${total} item${total === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-0 px-4 pb-24 md:gap-10 md:px-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 pt-8 md:block lg:w-64">
          <div className="sticky top-[100px] glass-card rounded-2xl p-5">
            {sidebarContent}
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 pt-8">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => setSideOpen(true)}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted transition-colors hover:border-text/40 hover:text-text md:hidden"
            >
              <SlidersHorizontal size={13} />
              Filters {chips.length > 0 && `(${chips.length})`}
            </button>
            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="cursor-pointer appearance-none rounded-full border border-border bg-transparent py-2 pl-4 pr-9 text-[10px] font-bold uppercase tracking-wider text-text outline-none focus:border-accent transition-colors"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-surface text-text">{o.label}</option>)}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>

          <ActiveFilters chips={chips} onRemove={(k) => setParam(k, null)} onClear={clearAll} />

          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-x-6 md:gap-y-12">
            {loading && items.length === 0
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
              : items.length === 0
              ? (
                <div className="col-span-full flex flex-col items-center py-28 text-center">
                  <p className="font-display text-6xl font-bold text-border">0</p>
                  <p className="mt-4 text-sm text-muted">No products matched your filters.</p>
                  <button
                    onClick={clearAll}
                    className="mt-6 rounded-full border border-border px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    Clear filters
                  </button>
                </div>
              )
              : items.map((p, i) => {
                  // Inject editorial break every 10 products
                  const showBreak = i > 0 && i % 10 === 0;
                  return (
                    <motion.div key={p.id} className="contents">
                      {showBreak && <EditorialBreak index={i / 10} />}
                      <div className="contents">
                        <ProductCard product={p} index={i} onQuickView={setQv} />
                      </div>
                    </motion.div>
                  );
                })
            }
          </div>

          {!loading && pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPageNum(page - 1)}
                className="rounded-full border border-border px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="text-[11px] font-bold text-muted">{page} / {pages}</span>
              <button
                disabled={page >= pages}
                onClick={() => setPageNum(page + 1)}
                className="rounded-full border border-border px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setSideOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-full overflow-y-auto bg-bg px-5 py-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-medium">Filters</h2>
                <button onClick={() => setSideOpen(false)} className="text-muted hover:text-text"><X size={20} /></button>
              </div>
              {sidebarContent}
              <button
                onClick={() => setSideOpen(false)}
                className="mt-8 w-full rounded-full bg-accent py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--h-text-inv)]"
              >
                Show {total} results
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <QuickView product={qv} onClose={() => setQv(null)} />
    </>
  );
}