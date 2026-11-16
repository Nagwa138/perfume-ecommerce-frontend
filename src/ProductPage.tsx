import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, CheckCircle, ChevronRight, ChevronDown,
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
            i < Math.floor(rating) ? "fill-accent text-accent"
            : i < rating ? "fill-accent/50 text-accent"
            : "fill-transparent text-border"
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
      <span className="w-6 text-right text-xs font-semibold text-text">{value}</span>
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

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-widest text-text transition-colors hover:text-accent"
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 text-sm leading-relaxed text-muted">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RelatedCard({ product: r }: { product: Product }) {
  const minP = r.sale_price ?? Math.min(...(r.sizes ?? []).map((s) => s.price).filter(Boolean), 0);
  const hasDiscount = r.sale_price != null;
  return (
    <Link to={`/product/${r.slug || r.id}`} className="group block w-40 shrink-0 md:w-auto">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-2 border border-border/50">
        {r.images?.[0] ? (
          <img src={r.images[0]} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><span className="font-display text-3xl font-bold text-white/10">{BRAND.nameUpper}</span></div>
        )}
      </div>
      <p className="mt-2 line-clamp-1 font-display text-sm font-medium">{r.name}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-sm font-bold ${hasDiscount ? "text-sale" : ""}`}>{fmtEGP(minP)}</span>
      </div>
    </Link>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ProductPage() {
  const { id } = useParams();

  const [p,          setP]          = useState<Product | null | undefined>(undefined);
  const [related,    setRelated]    = useState<Product[]>([]);
  const [reviews,    setReviews]    = useState<Review[]>([]);
  const [dbVariants, setDbVariants] = useState<ProductVariant[]>([]);
  const [mediaTab,   setMediaTab]   = useState<"photo" | "3d">("photo");
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
        <p className="font-display text-7xl font-bold text-border">404</p>
        <p className="mt-4 text-muted">Product not found.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-[color:var(--h-text-inv)] transition-colors hover:bg-accent-2">
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

  const chosenSize    = selSize ?? (sizes.find((s) => s.stock > 0)?.ml ?? sizes[0]?.ml ?? 0);
  const chosenSizeObj = sizes.find((s) => s.ml === chosenSize);
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

  // Rating distribution
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const idx = Math.min(4, Math.max(0, Math.round(r.rating) - 1));
    ratingCounts[idx]++;
  });

  return (
    <>
      <motion.main
        className="mx-auto max-w-6xl px-4 pb-32 pt-20 md:px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1 text-xs text-muted">
          <Link to="/" className="transition-colors hover:text-text">Home</Link>
          {p.product_type && (
            <>
              <ChevronRight size={11} className="shrink-0" />
              <Link to={`/shop?product_type=${p.product_type}`} className="transition-colors hover:text-text capitalize">
                {p.product_type === "perfume" ? "Fragrance" : p.product_type}
              </Link>
            </>
          )}
          <ChevronRight size={11} className="shrink-0" />
          <span className="line-clamp-1 text-text/80">{p.name}</span>
        </nav>

        {/* 2-col layout */}
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">

          {/* Media */}
          <div>
            <div className="mb-4 flex gap-2">
              {(["photo", "3d"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMediaTab(t)}
                  className={`rounded-full border px-5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    mediaTab === t
                      ? "border-accent bg-accent text-[color:var(--h-text-inv)]"
                      : "border-border text-muted hover:border-text/40 hover:text-text"
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

          {/* Details (Glass Panel) */}
          <div className="glass-card rounded-2xl p-6 md:p-8 h-fit">
            <div className="flex flex-col gap-5">
              {/* Brand / name / rating */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  {p.brand}
                  {p.year ? ` · ${p.year}` : ""}
                  {p.concentration ? ` · ${p.concentration}` : ""}
                </p>
                <h1 className="mt-2 font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl text-text">
                  {p.name}
                </h1>
                {p.review_count > 0 && (
                  <div className="mt-3">
                    <StarRating rating={p.rating} count={p.review_count} />
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className={`text-3xl font-display ${hasDiscount ? "text-sale" : "text-text"}`}>
                  {fmtEGP(displayPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-muted line-through">{fmtEGP(origPriceVal)}</span>
                    <span className="rounded-full bg-sale/15 px-2 py-0.5 text-[10px] font-bold text-sale">−{discountPct}%</span>
                  </>
                )}
              </div>

              {/* Makeup shade selector */}
              {isMakeup && variants.length > 0 && (
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Shade — <span className="text-text">{variants[selShade]?.name}</span>
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {variants.map((v, i) => (
                      <button
                        key={v.shade_hex}
                        title={v.name}
                        onClick={() => setSelShade(i)}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          selShade === i ? "scale-110 border-accent ring-2 ring-accent/20" : "border-transparent opacity-60 hover:scale-105 hover:opacity-100"
                        }`}
                        style={{ background: v.shade_hex }}
                        aria-label={v.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {sizes.length > 0 && (
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                    Size {chosenSize > 0 && <span className="text-text">— {chosenSize} ml</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((sz) => (
                      <button
                        key={sz.ml}
                        disabled={sz.stock === 0}
                        onClick={() => setSelSize(selSize === sz.ml ? null : sz.ml)}
                        className={`rounded-full border px-4 py-2 text-xs font-bold transition-all disabled:opacity-30 ${
                          chosenSize === sz.ml
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border text-muted hover:border-text/40 hover:text-text"
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
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Skin type:</span>
                  {(p.skin_type ?? []).map((st) => (
                    <span key={st} className="rounded-full border border-border px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-text/70 capitalize">{st}</span>
                  ))}
                </div>
              )}

              {/* Qty + Add + Wishlist */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center rounded-full border border-border bg-surface-2">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"
                    className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-text">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 select-none text-center text-sm font-bold text-text">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(Math.max(chosenStock, 1), q + 1))} aria-label="Increase quantity"
                    className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-text">
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  ref={addBtnRef}
                  disabled={chosenStock < 1}
                  onClick={handleAdd}
                  className="flex-1 rounded-full bg-accent py-3.5 text-xs font-bold uppercase tracking-widest text-[color:var(--h-text-inv)] transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
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
                <div className="space-y-3 rounded-xl border border-border bg-surface/50 px-4 py-4 mt-2">
                  {p.longevity > 0 && <Meter value={p.longevity} label="Longevity" colorClass="bg-accent" />}
                  {p.sillage   > 0 && <Meter value={p.sillage}   label="Sillage"   colorClass="bg-accent/70" />}
                </div>
              )}

              {/* Free shipping nudge */}
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface/50 px-4 py-3 mt-1">
                <Package size={15} className="shrink-0 text-accent" />
                <p className="text-[11px] text-muted">
                  Free shipping on orders over <span className="font-bold text-text">{fmtEGP(FREE_SHIPPING_USD)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Accordions */}
        <div className="mt-16 max-w-4xl">
          <h2 className="font-display text-2xl font-medium text-text">The Details</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">{p.description || "No description available."}</p>

          {isFragrance && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Top Notes", notes: p.top_notes,   Icon: Wind, color: "text-sky-300" },
                { label: "Heart Notes", notes: p.heart_notes, Icon: Droplets, color: "text-rose-300" },
                { label: "Base Notes", notes: p.base_notes,  Icon: Flame,    color: "text-amber-300" },
              ].filter(({ notes }) => (notes ?? []).length > 0).map(({ label, notes, Icon, color }) => (
                <div key={label} className="rounded-xl border border-border bg-surface-2 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon size={14} className={color} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(notes ?? []).map((n) => <NoteChip key={n} note={n} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 border-t border-border/60">
            {p.ingredients && (
              <Accordion title="Ingredients">
                <p>{p.ingredients}</p>
              </Accordion>
            )}
            {p.how_to_use && (
              <Accordion title="How to Use">
                <p>{p.how_to_use}</p>
              </Accordion>
            )}
            <Accordion title="Delivery & Returns">
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-text mb-0.5">Standard Shipping</p>
                  <p>Free on orders over {fmtEGP(FREE_SHIPPING_USD)} — otherwise EGP 75. Delivered in 2–5 business days.</p>
                </div>
                <div>
                  <p className="font-semibold text-text mb-0.5">Express Shipping</p>
                  <p>EGP 150. Delivered next business day. Select at checkout.</p>
                </div>
                <div>
                  <p className="font-semibold text-text mb-0.5">Returns</p>
                  <p>Free returns within 30 days. Items must be unopened or unused, with original packaging.</p>
                </div>
              </div>
            </Accordion>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-16 border-t border-border/60 pt-12">
            <div className="grid gap-10 md:grid-cols-[280px_1fr]">
              {/* Rating Bars */}
              <div className="glass-card rounded-2xl p-6 h-fit">
                <h2 className="font-display text-2xl font-medium">Customer Reviews</h2>
                <div className="mt-4 flex items-center gap-3">
                  <span className="font-display text-4xl text-accent">{p.rating.toFixed(1)}</span>
                  <div>
                    <StarRating rating={p.rating} count={p.review_count} />
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingCounts[stars - 1];
                    const pct = p.review_count ? (count / p.review_count) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-muted">{stars} ★</span>
                        <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right text-muted">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.slice(0, 6).map((rv) => (
                  <div key={rv.id} className="rounded-xl border border-border bg-surface-2 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-text">{rv.author}</p>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} className={i < rv.rating ? "fill-accent text-accent" : "fill-transparent text-border"} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted">{rv.date}</span>
                    </div>
                    {rv.title && <p className="mt-3 text-sm font-medium text-text">{rv.title}</p>}
                    {rv.body && <p className="mt-1 text-sm text-muted">{rv.body}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-border/60 pt-12">
            <h2 className="mb-8 font-display text-2xl font-medium text-text">You may also like</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
              {related.slice(0, 8).map((r) => <RelatedCard key={r.id} product={r} />)}
            </div>
          </div>
        )}
      </motion.main>

      {/* Sticky mobile bar */}
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
                <p className="truncate text-sm font-bold">{p.name}</p>
              </div>
              <span className="shrink-0 font-display font-bold text-accent">{fmtEGP(displayPrice)}</span>
              <button
                onClick={handleAdd}
                className="shrink-0 rounded-full bg-accent px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[color:var(--h-text-inv)] transition-colors hover:bg-accent-2"
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