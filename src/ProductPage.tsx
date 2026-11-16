import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, CheckCircle, ChevronRight, ChevronDown,
  Heart, Minus, Plus, Star,
  Droplets, Wind, Flame,
  Truck, ShieldCheck, RotateCcw
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
    <div className="flex flex-col-reverse md:flex-row gap-4">
      
      {/* Thumbnails (Horizontal on mobile, Vertical on desktop) */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto hide-scrollbar md:w-24 shrink-0">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              className={`relative w-20 h-24 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 ${
                i === safe ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#FAFAFA]">
        {images.length > 0 ? (
          <img
            key={safe}
            src={images[safe]}
            alt={`${name} — image ${safe + 1}`}
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-extrabold text-6xl tracking-widest text-gray-200">{BRAND.nameUpper}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} className={
            i < Math.floor(rating) ? "fill-[#D9385E] text-[#D9385E]"
            : i < rating ? "fill-[#D9385E]/50 text-[#D9385E]"
            : "fill-transparent text-gray-300"
          } />
        ))}
      </div>
      <span className="text-xs text-gray-500">
        {rating.toFixed(1)}&ensp;·&ensp;{count} {count === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
}

function Meter({ value, max = 10, label, colorClass = "bg-[#D9385E]" }: {
  value: number; max?: number; label: string; colorClass?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-gray-500 font-medium">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full ${colorClass}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs font-bold text-black">{value}</span>
    </div>
  );
}

function NoteChip({ note }: { note: string }) {
  return (
    <span className="inline-block rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700">
      {note}
    </span>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <div className="flex items-center gap-1.5 text-sm mt-2"><AlertCircle size={14} className="text-red-500" /><span className="font-medium text-red-500">Sold out</span></div>;
  if (stock <= 5) return <div className="flex items-center gap-1.5 text-sm mt-2"><AlertCircle size={14} className="text-orange-500" /><span className="text-orange-500 font-medium">Only {stock} left</span></div>;
  return <div className="flex items-center gap-1.5 text-sm mt-2"><CheckCircle size={14} className="text-green-600" /><span className="text-green-600 font-medium">In stock</span></div>;
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-sm font-bold text-black transition-colors hover:text-[#D9385E]"
      >
        {title}
        <ChevronDown size={16} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
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
            <div className="pt-3 text-sm leading-relaxed text-gray-600">
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
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#FAFAFA]">
        {r.images?.[0] ? (
          <img src={r.images[0]} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><span className="font-extrabold text-3xl text-gray-200">{BRAND.nameUpper}</span></div>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-medium text-black">{r.name}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-sm font-bold ${hasDiscount ? "text-[#D9385E]" : "text-black"}`}>{fmtEGP(minP)}</span>
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
  }, [id, track]);

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
      <div className="min-h-screen bg-white pt-20 pb-16">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="animate-pulse space-y-3">
              <div className="aspect-[4/5] rounded-2xl bg-gray-100" />
            </div>
            <div className="animate-pulse space-y-4 pt-2">
              <div className="h-3 w-24 rounded bg-gray-100" />
              <div className="h-9 w-3/4 rounded bg-gray-100" />
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-10 w-28 rounded bg-gray-100" />
              <div className="h-20 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (p === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
        <p className="text-7xl font-extrabold text-gray-200">404</p>
        <p className="mt-4 text-gray-500">Product not found.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800">
          Back to shop
        </Link>
      </div>
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
    <div className="bg-white min-h-screen pb-32">
      
      <motion.main
        className="mx-auto max-w-[1400px] px-4 md:px-8 pt-6 md:pt-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-gray-500">
          <Link to="/" className="transition-colors hover:text-black">Home</Link>
          {p.product_type && (
            <>
              <ChevronRight size={11} className="shrink-0" />
              <Link to={`/shop?product_type=${p.product_type}`} className="transition-colors hover:text-black capitalize">
                {p.product_type === "perfume" ? "Fragrance" : p.product_type}
              </Link>
            </>
          )}
          <ChevronRight size={11} className="shrink-0" />
          <span className="line-clamp-1 text-black font-medium">{p.name}</span>
        </nav>

        {/* 2-col layout */}
        <div className="grid gap-8 lg:gap-16 lg:grid-cols-[1.1fr_1fr]">

          {/* Media Section */}
          <div>
            <div className="mb-4 flex gap-2">
              {(["photo", "3d"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMediaTab(t)}
                  className={`rounded-full border px-5 py-1.5 text-xs font-bold transition-all ${
                    mediaTab === t
                      ? "border-black bg-black text-white"
                      : "border-gray-200 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {t === "photo" ? "Photo" : "3D View"}
                </button>
              ))}
            </div>

            {mediaTab === "3d" ? (
              <Suspense fallback={<div className="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100" />}>
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

          {/* Details Section */}
          <div className="flex flex-col gap-5">
            
            {/* Brand / name / rating */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                {p.brand}
                {p.year ? ` · ${p.year}` : ""}
                {p.concentration ? ` · ${p.concentration}` : ""}
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight text-black">
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
              <span className={`text-3xl font-extrabold ${hasDiscount ? "text-[#D9385E]" : "text-black"}`}>
                {fmtEGP(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">{fmtEGP(origPriceVal)}</span>
                  <span className="rounded-full bg-[#D9385E]/10 px-2.5 py-0.5 text-xs font-bold text-[#D9385E]">Save {discountPct}%</span>
                </>
              )}
            </div>

            {/* Makeup shade selector */}
            {isMakeup && variants.length > 0 && (
              <div className="mt-2">
                <p className="mb-3 text-xs font-bold text-black">
                  Shade — <span className="text-gray-500 font-medium">{variants[selShade]?.name}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v, i) => (
                    <button
                      key={v.shade_hex}
                      title={v.name}
                      onClick={() => setSelShade(i)}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        selShade === i ? "scale-110 border-black ring-2 ring-black/10" : "border-transparent opacity-60 hover:scale-105 hover:opacity-100"
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
              <div className="mt-2">
                <p className="mb-3 text-xs font-bold text-black">
                  Size {chosenSize > 0 && <span className="text-gray-500 font-medium">— {chosenSize} ml</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <button
                      key={sz.ml}
                      disabled={sz.stock === 0}
                      onClick={() => setSelSize(sz.ml)}
                      className={`rounded-full border px-5 py-2 text-xs font-bold transition-all disabled:opacity-30 ${
                        chosenSize === sz.ml
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-600 hover:border-black hover:text-black"
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
              <div className="flex flex-wrap gap-2 items-center mt-2">
                <span className="text-xs font-bold text-black">Skin type:</span>
                {(p.skin_type ?? []).map((st) => (
                  <span key={st} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 capitalize">{st}</span>
                ))}
              </div>
            )}

            {/* Qty + Add + Wishlist */}
            <div className="flex items-center gap-3 pt-4">
              <div className="flex items-center rounded-full border border-gray-300 bg-white">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"
                  className="flex h-12 w-12 items-center justify-center text-gray-500 transition-colors hover:text-black">
                  <Minus size={16} />
                </button>
                <span className="w-8 select-none text-center text-sm font-bold text-black">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(Math.max(chosenStock, 1), q + 1))} aria-label="Increase quantity"
                  className="flex h-12 w-12 items-center justify-center text-gray-500 transition-colors hover:text-black">
                  <Plus size={16} />
                </button>
              </div>

              <button
                ref={addBtnRef}
                disabled={chosenStock < 1}
                onClick={handleAdd}
                className="flex-1 rounded-full bg-[#D9385E] py-4 text-sm font-bold text-white transition-colors hover:bg-[#B82A4B] disabled:cursor-not-allowed disabled:opacity-50 shadow-md"
              >
                {chosenStock < 1 ? "Sold Out" : "Add to Cart"}
              </button>

              <button
                aria-label={isWished ? "Remove from wishlist" : "Save to wishlist"}
                onClick={() => toggleWish(p.id)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                  isWished ? "border-[#D9385E] bg-pink-50 text-[#D9385E]" : "border-gray-300 text-gray-500 hover:border-black hover:text-black"
                }`}
              >
                <Heart size={18} className={isWished ? "fill-current" : ""} />
              </button>
            </div>

            <StockBadge stock={chosenStock} />

            {/* Fragrance meters */}
            {isFragrance && (p.longevity > 0 || p.sillage > 0) && (
              <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#FAFAFA] px-5 py-4 mt-2">
                {p.longevity > 0 && <Meter value={p.longevity} label="Longevity" />}
                {p.sillage   > 0 && <Meter value={p.sillage}   label="Sillage" colorClass="bg-[#D9385E]/70" />}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <Truck size={16} className="text-[#D9385E]" /> Free Delivery
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <ShieldCheck size={16} className="text-[#D9385E]" /> 100% Authentic
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <RotateCcw size={16} className="text-[#D9385E]" /> 14-Day Returns
              </div>
            </div>

          </div>
        </div>

        {/* Description & Accordions */}
        <div className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-extrabold text-black">The Details</h2>
          <p className="mt-4 text-sm md:text-base leading-relaxed text-gray-600">{p.description || "No description available."}</p>

          {isFragrance && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Top Notes", notes: p.top_notes,   Icon: Wind, color: "text-sky-500" },
                { label: "Heart Notes", notes: p.heart_notes, Icon: Droplets, color: "text-rose-500" },
                { label: "Base Notes", notes: p.base_notes,  Icon: Flame,    color: "text-amber-500" },
              ].filter(({ notes }) => (notes ?? []).length > 0).map(({ label, notes, Icon, color }) => (
                <div key={label} className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon size={16} className={color} />
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-700">{label}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(notes ?? []).map((n) => <NoteChip key={n} note={n} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 border-t border-gray-100">
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
                  <p className="font-semibold text-black mb-0.5">Standard Shipping</p>
                  <p>Free on orders over {fmtEGP(FREE_SHIPPING_USD)} — otherwise EGP 75. Delivered in 2–5 business days.</p>
                </div>
                <div>
                  <p className="font-semibold text-black mb-0.5">Express Shipping</p>
                  <p>EGP 150. Delivered next business day. Select at checkout.</p>
                </div>
                <div>
                  <p className="font-semibold text-black mb-0.5">Returns</p>
                  <p>Free returns within 30 days. Items must be unopened or unused, with original packaging.</p>
                </div>
              </div>
            </Accordion>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-12">
            <div className="grid gap-10 md:grid-cols-[280px_1fr]">
              {/* Rating Bars */}
              <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6 h-fit">
                <h2 className="text-xl font-extrabold text-black">Customer Reviews</h2>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-4xl font-extrabold text-black">{p.rating.toFixed(1)}</span>
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
                        <span className="w-8 text-gray-500 font-medium">{stars} ★</span>
                        <div className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full bg-[#D9385E] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.slice(0, 6).map((rv) => (
                  <div key={rv.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-black">{rv.author}</p>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} className={i < rv.rating ? "fill-[#D9385E] text-[#D9385E]" : "fill-transparent text-gray-300"} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{rv.date}</span>
                    </div>
                    {rv.title && <p className="mt-3 text-sm font-bold text-black">{rv.title}</p>}
                    {rv.body && <p className="mt-1 text-sm text-gray-600">{rv.body}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-12 pb-10">
            <h2 className="mb-8 text-2xl font-extrabold text-black">You may also like</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0 hide-scrollbar">
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
            className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md md:hidden"
          >
            <div className="mx-auto flex max-w-md items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Add to cart</p>
                <p className="truncate text-sm font-bold text-black">{p.name}</p>
              </div>
              <span className="shrink-0 font-bold text-[#D9385E]">{fmtEGP(displayPrice)}</span>
              <button
                onClick={handleAdd}
                className="shrink-0 rounded-full bg-[#D9385E] px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#B82A4B]"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}