import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, CheckCircle, ChevronRight,
  Heart, Minus, Package, Plus, Star,
  Droplets, Wind, Flame,
} from "lucide-react";
import { getProduct, getRelated, getReviews, getProductVariants, fmtEGP, FREE_SHIPPING_USD, type Product, type ProductVariant, type Review } from "./api";
import { useCart, useWishlist, useRecentlyViewed } from "./store";
import { useTitle } from "./hooks/useTitle";
import { BRAND } from "./brand";

const Product3D = lazy(() => import("./product3d"));

// ── Sub-components ─────────────────────────────────────────────────────────────

function ImageGallery({ images, name, activeIndex, onIndexChange }: {
  images: string[]; name: string; activeIndex: number; onIndexChange: (i: number) => void;
}) {
  const safe = Math.min(activeIndex, Math.max(images.length - 1, 0));
  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2">
        {images.length > 0 ? (
          <img
            key={safe}
            src={images[safe]}
            alt={`${name} — image ${safe + 1}`}
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-6xl font-bold tracking-widest text-white/10">{BRAND.nameUpper}</span>
          </div>
        )}
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white/70 backdrop-blur-sm">
            {safe + 1} / {images.length}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              style={{ width: 60, aspectRatio: "4/5" }}
              className={`relative shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                i === safe ? "ring-2 ring-accent ring-offset-2 ring-offset-bg" : "opacity-50 hover:opacity-80"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} className={
            i < Math.floor(rating) ? "fill-amber-400 text-amber-400"
            : i < rating ? "fill-amber-400/50 text-amber-400"
            : "fill-transparent text-white/20"
          } />
        ))}
      </div>
      <span className="text-xs text-muted">
        {rating.toFixed(1)}&ensp;·&ensp;{count} {count === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
}

function Meter({ value, max = 10, label, colorClass = "bg-accent" }: {
  value: number; max?: number; label: string; colorClass?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-muted">{label}</span>
      <div className="meter-bar flex-1">
        <div
          className={`meter-fill ${colorClass}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-white/70">{value}</span>
    </div>
  );
}

function NoteChip({ note }: { note: string }) {
  return (
    <span className="note-chip inline-block rounded-full border border-accent/25 px-2.5 py-0.5 text-[11px] text-accent/80">
      {note}
    </span>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <div className="flex items-center gap-1.5 text-sm"><AlertCircle size={14} className="text-sale" /><span className="font-medium text-sale">Sold out</span></div>;
  if (stock <= 5) return <div className="flex items-center gap-1.5 text-sm"><AlertCircle size={14} className="text-orange-400" /><span className="text-orange-400">Only {stock} left</span></div>;
  return <div className="flex items-center gap-1.5 text-sm"><CheckCircle size={14} className="text-success" /><span className="text-muted">In stock</span></div>;
}

function RelatedCard({ product: r }: { product: Product }) {
  const minP = r.sale_price ?? Math.min(...(r.sizes ?? []).map((s) => s.price).filter(Boolean), 0);
  const hasDiscount = r.sale_price != null;
  return (
    <Link to={`/product/${r.slug || r.id}`} className="group block w-40 shrink-0 md:w-auto">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-2">
        {r.images?.[0] ? (
          <img src={r.images[0]} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><span className="font-display text-3xl font-bold text-white/10">{BRAND.nameUpper}</span></div>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-medium">{r.name}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-sm font-semibold ${hasDiscount ? "text-sale" : ""}`}>{fmtEGP(minP)}</span>
      </div>
    </Link>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

type TabName = "Description" | "Notes" | "Ingredients" | "How to Use" | "Shipping & Returns";

export default function ProductPage() {
  const { id } = useParams();

  const [p,          setP]          = useState<Product | null | undefined>(undefined);
  const [related,    setRelated]    = useState<Product[]>([]);
  const [reviews,    setReviews]    = useState<Review[]>([]);
  const [dbVariants, setDbVariants] = useState<ProductVariant[]>([]);
  const [mediaTab,   setMediaTab]   = useState<"photo" | "3d">("photo");
  const [activeTab,  setActiveTab]  = useState<TabName>("Description");
  const [selSize,    setSelSize]    = useState<number | null>(null);
  const [selShade,   setSelShade]   = useState<number>(0);
  const [imgIdx,     setImgIdx]     = useState(0);
  const [qty,        setQty]        = useState(1);
  const [sticky,     setSticky]     = useState(false);

  const addBtnRef = useRef<HTMLButtonElement>(null);
  const add = useCart((s) => s.add);
  const { toggle: toggleWish, has } = useWishlist();
  const track = useRecentlyViewed((s) => s.track);

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    setP(undefined); setMediaTab("photo"); setSelSize(null); setQty(1);
    setRelated([]); setReviews([]); setDbVariants([]);
    getProduct(id).then((product) => {
      setP(product);
      if (!product) return;
      track(product);
      const slugOrId = product.slug || String(product.id);
      getRelated(slugOrId).then(setRelated);
      getReviews(slugOrId).then(setReviews);
      if (product.product_type === "makeup") {
        getProductVariants(slugOrId).then(setDbVariants);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const btn = addBtnRef.current;
    if (!btn) return;
    const obs = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting), { threshold: 0 });
    obs.observe(btn);
    return () => obs.disconnect();
  }, [p]);

  useTitle(p != null ? p.name : "");

  if (p === undefined) {
    return (
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-20">
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="animate-pulse space-y-3">
            <div className="aspect-[4/5] rounded-2xl bg-surface-2" />
          </div>
          <div className="animate-pulse space-y-4 pt-2">
            <div className="h-3 w-24 rounded bg-surface-2" />
            <div className="h-9 w-3/4 rounded bg-surface-2" />
            <div className="h-4 w-32 rounded bg-surface-2" />
            <div className="h-10 w-28 rounded bg-surface-2" />
            <div className="h-20 rounded bg-surface-2" />
          </div>
        </div>
      </main>
    );
  }

  if (p === null) {
    return (
      <main className="flex flex-col items-center justify-center px-6 py-40 text-center">
        <p className="font-display text-7xl font-bold text-white/10">404</p>
        <p className="mt-4 text-muted">Product not found.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-2">
          Back to shop
        </Link>
      </main>
    );
  }

  // Derived
  const isFragrance = p.product_type === "perfume";
  const isMakeup    = p.product_type === "makeup";
  const images      = (p.images ?? []).filter(Boolean) as string[];
  const sizes       = p.sizes ?? [];
  const variants    = p.variants ?? [];

  // For makeup, pick first available shade; for others pick first size
  const chosenSize    = selSize ?? (sizes.find((s) => s.stock > 0)?.ml ?? sizes[0]?.ml ?? 0);
  const chosenSizeObj = sizes.find((s) => s.ml === chosenSize);
  // Prefer relational variant data when available (populated after seed)
  const chosenDbVariant = isMakeup ? (dbVariants[selShade] ?? null) : null;
  const displayPrice  = p.sale_price ?? chosenDbVariant?.price ?? chosenSizeObj?.price ?? 0;
  const origPriceVal  = chosenDbVariant?.price ?? chosenSizeObj?.price ?? 0;
  const hasDiscount   = p.sale_price != null && p.sale_price < origPriceVal;
  const discountPct   = hasDiscount ? Math.round((1 - displayPrice / origPriceVal) * 100) : 0;
  const chosenStock   = isMakeup
    ? (chosenDbVariant?.stock ?? variants[selShade]?.stock ?? 0)
    : (chosenSizeObj?.stock ?? 0);
  const isWished = has(p.id);

  const handleAdd = () => {
    const variantId    = isMakeup ? (chosenDbVariant?.id ?? null) : null;
    const variantLabel = isMakeup ? (chosenDbVariant?.label ?? variants[selShade]?.name ?? "") : "";
    for (let i = 0; i < qty; i++) add(p, chosenSize, variantId, variantLabel);
  };

  const TABS: TabName[] = [
    "Description",
    ...(isFragrance ? ["Notes" as TabName] : []),
    ...(p.ingredients ? ["Ingredients" as TabName] : []),
    ...(p.how_to_use  ? ["How to Use" as TabName] : []),
    "Shipping & Returns",
  ];

  return (
    <>
      <motion.main
        className="mx-auto max-w-5xl px-6 pb-32 pt-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1 text-xs text-muted">
          <Link to="/" className="transition-colors hover:text-white">Home</Link>
          {p.product_type && (
            <>
              <ChevronRight size={11} className="shrink-0" />
              <Link to={`/shop?product_type=${p.product_type}`} className="transition-colors hover:text-white capitalize">
                {p.product_type === "perfume" ? "Fragrance" : p.product_type}
              </Link>
            </>
          )}
          <ChevronRight size={11} className="shrink-0" />
          <span className="line-clamp-1 text-white/80">{p.name}</span>
        </nav>

        {/* 2-col layout */}
        <div className="grid gap-10 md:grid-cols-2">

          {/* Media */}
          <div>
            <div className="mb-3 flex gap-2">
              {(["photo", "3d"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMediaTab(t)}
                  className={`rounded-full border px-4 py-1 text-sm font-semibold transition-all ${
                    mediaTab === t
                      ? "border-accent bg-accent text-white"
                      : "border-white/20 text-muted hover:border-white/50 hover:text-white"
                  }`}
                >
                  {t === "photo" ? "Photo" : "3D"}
                </button>
              ))}
            </div>

            {mediaTab === "3d" ? (
              <Suspense fallback={<div className="aspect-[4/5] animate-pulse rounded-2xl bg-surface-2" />}>
                <Product3D
                  productType={p.product_type}
                  subcategory={p.subcategory ?? ""}
                  capStyle={p.cap_style}
                  liquidColor={p.bottle_color}
                  shadeHex={isMakeup && variants.length > 0 ? variants[selShade]?.shade_hex : ""}
                  name={p.name}
                />
              </Suspense>
            ) : (
              <ImageGallery images={images} name={p.name} activeIndex={imgIdx} onIndexChange={setImgIdx} />
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">

            {/* Brand / name / rating */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                {p.brand}
                {p.year ? ` · ${p.year}` : ""}
                {p.concentration ? ` · ${p.concentration}` : ""}
              </p>
              <h1 className="mt-1.5 font-display text-4xl font-bold leading-tight tracking-tight">
                {p.name}
              </h1>
              {p.review_count > 0 && (
                <div className="mt-2.5">
                  <StarRating rating={p.rating} count={p.review_count} />
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className={`text-3xl font-black ${hasDiscount ? "text-sale" : "text-white"}`}>
                {fmtEGP(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted line-through">{fmtEGP(origPriceVal)}</span>
                  <span className="rounded-full bg-sale/15 px-2 py-0.5 text-xs font-bold text-sale">−{discountPct}%</span>
                </>
              )}
            </div>

            {/* Makeup shade selector */}
            {isMakeup && variants.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                  Shade —{" "}
                  <span className="font-normal normal-case tracking-normal text-white">{variants[selShade]?.name}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => (
                    <button
                      key={v.shade_hex}
                      title={v.name}
                      onClick={() => setSelShade(i)}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${
                        selShade === i ? "scale-110 border-white" : "border-transparent opacity-60 hover:scale-105 hover:opacity-100"
                      }`}
                      style={{ background: v.shade_hex }}
                      aria-label={v.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size / volume selector (non-makeup or makeup with sizes) */}
            {sizes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                  Size
                  {chosenSize > 0 && <span className="ml-1.5 font-normal normal-case tracking-normal text-white">— {chosenSize} ml</span>}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((sz) => (
                    <button
                      key={sz.ml}
                      disabled={sz.stock === 0}
                      onClick={() => setSelSize(selSize === sz.ml ? null : sz.ml)}
                      className={`rounded-md border px-3.5 py-2 text-sm font-medium transition-all disabled:opacity-30 ${
                        chosenSize === sz.ml
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-border text-muted hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {sz.ml} ml
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Skin type tags */}
            {(p.skin_type ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted mr-1 self-center">Skin type:</span>
                {(p.skin_type ?? []).map((st) => (
                  <span key={st} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-white/60 capitalize">{st}</span>
                ))}
              </div>
            )}

            {/* Qty + Add to cart + Wishlist */}
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"
                  className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-white">
                  <Minus size={14} />
                </button>
                <span className="w-8 select-none text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(Math.max(chosenStock, 1), q + 1))} aria-label="Increase quantity"
                  className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-white">
                  <Plus size={14} />
                </button>
              </div>

              <button
                ref={addBtnRef}
                disabled={chosenStock < 1}
                onClick={handleAdd}
                className="flex-1 rounded-full bg-accent py-3 text-sm font-bold tracking-wider text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {chosenStock < 1 ? "Sold Out" : "Add to Cart"}
              </button>

              <button
                aria-label={isWished ? "Remove from wishlist" : "Save to wishlist"}
                onClick={() => toggleWish(p.id)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-all hover:border-accent"
              >
                <Heart size={16} className={isWished ? "fill-accent text-accent" : "text-muted"} />
              </button>
            </div>

            <StockBadge stock={chosenStock} />

            {/* Fragrance meters */}
            {isFragrance && (p.longevity > 0 || p.sillage > 0) && (
              <div className="space-y-2.5 rounded-xl border border-border bg-surface-2 px-4 py-3">
                {p.longevity > 0 && <Meter value={p.longevity} label="Longevity" colorClass="bg-accent" />}
                {p.sillage   > 0 && <Meter value={p.sillage}   label="Sillage"   colorClass="bg-accent/70" />}
              </div>
            )}

            {/* Season + Occasion tags */}
            {((p.season?.length ?? 0) > 0 || (p.occasion?.length ?? 0) > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {(p.season ?? []).map((s) => <span key={s} className="rounded-full border border-border/60 px-2.5 py-0.5 text-[11px] text-muted capitalize">{s}</span>)}
                {(p.occasion ?? []).map((o) => <span key={o} className="rounded-full border border-border/60 px-2.5 py-0.5 text-[11px] text-muted capitalize">{o}</span>)}
              </div>
            )}

            {/* Free shipping nudge */}
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-4 py-3">
              <Package size={15} className="shrink-0 text-muted" />
              <p className="text-sm text-muted">
                Free shipping on orders over <span className="font-semibold text-white">{fmtEGP(FREE_SHIPPING_USD)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-14">
          <div className="flex border-b border-border overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`relative shrink-0 px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === t ? "text-white" : "text-muted hover:text-white/70"
                }`}
              >
                {t}
                {activeTab === t && (
                  <motion.div layoutId="tab-underline" className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="py-8"
            >
              {activeTab === "Description" && (
                <div className="max-w-2xl space-y-5">
                  <p className="leading-relaxed text-muted">{p.description || "No description available."}</p>
                  {isFragrance && p.perfumer && (
                    <p className="text-sm text-muted">Perfumer: <span className="text-white">{p.perfumer}</span></p>
                  )}
                  {(p.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(p.tags ?? []).map((t) => (
                        <span key={t} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Notes" && isFragrance && (
                <div className="max-w-2xl space-y-6">
                  {[
                    { label: "Top Notes", notes: p.top_notes,   Icon: Wind, color: "text-sky-300" },
                    { label: "Heart Notes", notes: p.heart_notes, Icon: Droplets, color: "text-rose-300" },
                    { label: "Base Notes", notes: p.base_notes,  Icon: Flame,    color: "text-amber-300" },
                  ].filter(({ notes }) => (notes ?? []).length > 0).map(({ label, notes, Icon, color }) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center gap-2">
                        <Icon size={14} className={color} />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
                      </div>
                      <div className="gold-divider mb-3" />
                      <div className="flex flex-wrap gap-1.5">
                        {(notes ?? []).map((n) => <NoteChip key={n} note={n} />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Ingredients" && (
                <div className="max-w-2xl">
                  <p className="text-sm leading-relaxed text-muted">{p.ingredients}</p>
                </div>
              )}

              {activeTab === "How to Use" && (
                <div className="max-w-2xl">
                  <p className="text-sm leading-relaxed text-muted">{p.how_to_use}</p>
                </div>
              )}

              {activeTab === "Shipping & Returns" && (
                <div className="max-w-2xl space-y-5 text-sm">
                  {[
                    { title: "Standard Shipping", body: `Free on orders over ${fmtEGP(FREE_SHIPPING_USD)} — otherwise EGP 75. Delivered in 2–5 business days.` },
                    { title: "Express Shipping",  body: "EGP 150. Delivered next business day. Select at checkout." },
                    { title: "Returns",           body: "Free returns within 30 days. Items must be unopened or unused, with original packaging." },
                  ].map(({ title, body }) => (
                    <div key={title}>
                      <p className="mb-0.5 font-semibold text-white">{title}</p>
                      <p className="text-muted">{body}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Reviews section */}
        {reviews.length > 0 && (
          <div className="mt-10 border-t border-border pt-10">
            <h2 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide">
              Customer Reviews ({reviews.length})
            </h2>
            <div className="space-y-4">
              {reviews.slice(0, 6).map((rv) => (
                <div key={rv.id} className="rounded-xl border border-border bg-surface-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{rv.author}</p>
                      <div className="mt-0.5 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} className={i < rv.rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-white/20"} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted">{rv.date}</span>
                  </div>
                  {rv.title && <p className="mt-2 text-sm font-medium text-white">{rv.title}</p>}
                  {rv.body && <p className="mt-1 text-sm text-muted">{rv.body}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-10 border-t border-border pt-12">
            <h2 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide">You may also like</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
              {related.slice(0, 8).map((r) => <RelatedCard key={r.id} product={r} />)}
            </div>
          </div>
        )}
      </motion.main>

      {/* Sticky add bar */}
      <AnimatePresence>
        {sticky && chosenStock > 0 && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 p-4 backdrop-blur-md md:hidden"
          >
            <div className="mx-auto flex max-w-sm items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-muted">Add to cart</p>
                <p className="truncate text-sm font-semibold">{p.name}</p>
              </div>
              <span className="shrink-0 font-bold">{fmtEGP(displayPrice)}</span>
              <button
                onClick={handleAdd}
                className="shrink-0 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-2"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
