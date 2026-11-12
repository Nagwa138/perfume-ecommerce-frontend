import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  AlertCircle, CheckCircle, ChevronRight,
  Heart, Minus, Package, Plus, Star,
} from "lucide-react";
import { getProduct, getRelated, fmtEGP, FREE_SHIPPING_USD, type Product } from "./api";
import { makeShirtGeometry } from "./Hero3D";
import { useCart, useWishlist, useRecentlyViewed } from "./store";
import { useTitle } from "./hooks/useTitle";

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// These are defined at module level so React never recreates them on re-render.
// PHP equivalent: Blade @include partials that live alongside a view.
// ─────────────────────────────────────────────────────────────────────────────

// ── 3D shirt viewer ───────────────────────────────────────────────────────────
// Only mounted when the user switches to the "3D" tab — so one WebGL context
// exists at a time (never alongside the Hero3D canvas on the home page).
function Viewer3D({ color }: { color: string }) {
  const geo = useMemo(makeShirtGeometry, []);
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false }}
      camera={{ position: [0, 0, 6], fov: 50 }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[4, 5, 5]} intensity={2} />
      <pointLight position={[-5, -3, 3]} intensity={25} color="#22d3ee" />
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={2}
      />
    </Canvas>
  );
}

// ── Image gallery (fully controlled — no internal state) ─────────────────────
function ImageGallery({
  images, name, activeIndex, onIndexChange,
}: {
  images: string[];
  name: string;
  activeIndex: number;
  onIndexChange: (i: number) => void;
}) {
  const safe = Math.min(activeIndex, images.length - 1);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image with hover zoom */}
      <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2">
        <img
          key={safe}
          src={images[safe]}
          alt={`${name} — image ${safe + 1}`}
          loading="eager"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white/70 backdrop-blur-sm">
            {safe + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              className={`relative shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                i === safe
                  ? "ring-2 ring-accent ring-offset-2 ring-offset-bg"
                  : "opacity-50 hover:opacity-80"
              }`}
              style={{ width: 60, aspectRatio: "4/5" }}
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

// ── Star rating display ───────────────────────────────────────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className={
              i < Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : i < rating
                ? "fill-amber-400/50 text-amber-400"
                : "fill-transparent text-white/20"
            }
          />
        ))}
      </div>
      <span className="text-xs text-muted">
        {rating.toFixed(1)}&ensp;·&ensp;{count}{" "}
        {count === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
}

// ── Stock indicator ───────────────────────────────────────────────────────────
function StockIndicator({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <AlertCircle size={14} className="shrink-0 text-sale" />
        <span className="font-medium text-sale">Sold out</span>
      </div>
    );
  if (stock <= 5)
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <AlertCircle size={14} className="shrink-0 text-orange-400" />
        <span className="text-orange-400">Only {stock} left — order soon</span>
      </div>
    );
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <CheckCircle size={14} className="shrink-0 text-success" />
      <span className="text-muted">In stock</span>
    </div>
  );
}

// ── Related product card ──────────────────────────────────────────────────────
// Intentionally simpler than ProductCard: no animations, no quick-view.
// A full-featured card here would need its own QuickView state.
function RelatedCard({ product: r }: { product: Product }) {
  const display = r.sale_price ?? r.price;
  const hasDiscount = r.sale_price != null && r.sale_price < r.price;
  return (
    <Link
      to={`/product/${r.slug || r.id}`}
      className="group block shrink-0 w-40 md:w-auto"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-2">
        <img
          src={r.images?.[0] ?? r.image}
          alt={r.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {r.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <span className="text-xs font-semibold text-white/70">Sold out</span>
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-medium">{r.name}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-sm font-semibold ${hasDiscount ? "text-sale" : ""}`}>
          {fmtEGP(display)}
        </span>
        {hasDiscount && (
          <span className="text-xs text-muted line-through">{fmtEGP(r.price)}</span>
        )}
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];
// Categories for which the shirt-shape 3D model is meaningful
const WEARABLE_CATS = ["Hoodies", "T-Shirts", "Jackets", "Shirts"];

const TABS = ["Description", "Details", "Shipping & returns"] as const;
type TabName = (typeof TABS)[number];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// PHP equivalent: ProductController@show + resources/views/products/show.blade.php
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const { id } = useParams();

  // p === undefined → still loading; p === null → 404
  // PHP equivalent: $product = Product::find($id); // returns null when not found
  const [p,         setP]         = useState<Product | null | undefined>(undefined);
  const [related,   setRelated]   = useState<Product[]>([]);
  const [mediaTab,       setMediaTab]       = useState<"photo" | "3d">("photo");
  const [activeTab,      setActiveTab]      = useState<TabName>("Description");
  const [size,           setSize]           = useState<string | null>(null);
  const [selColor,       setSelColor]       = useState<string | null>(null);
  const [colorImageIdx,  setColorImageIdx]  = useState(0);
  const [qty,            setQty]            = useState(1);
  const [sticky,         setSticky]         = useState(false);

  // Points at the main "Add to cart" button so IntersectionObserver can watch it.
  // useRef doesn't trigger re-renders when changed — like a plain object property.
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const add   = useCart((s) => s.add);
  const { toggle: toggleWish, has } = useWishlist();
  const track = useRecentlyViewed((s) => s.track);

  // ── Fetch product + related when :id changes ──────────────────────────────
  // PHP equivalent: the controller method that runs per-request.
  // Here it re-runs whenever `id` changes (browser navigation between products).
  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    setP(undefined);        // reset to loading
    setMediaTab("photo");
    setSize(null);
    setQty(1);
    setRelated([]);

    getProduct(id).then((product) => {
      setP(product);
      if (!product) return;
      track(product);       // record in "recently viewed" localStorage store
      setSelColor(product.colors?.[0]?.hex ?? product.color);
      getRelated(product.slug || String(product.id)).then(setRelated);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Show sticky bar when the Add button scrolls out of view ──────────────
  // IntersectionObserver: a browser API that fires when an element enters/exits
  // the viewport. No PHP equivalent — it's purely a browser scroll feature.
  useEffect(() => {
    const btn = addBtnRef.current;
    if (!btn) return;
    const obs = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(btn);
    return () => obs.disconnect();   // cleanup: like removeEventListener
  }, [p]);                           // re-observe after product renders

  useTitle(p != null && p !== undefined ? p.name : "");

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (p === undefined) {
    return (
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-20">
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="animate-pulse space-y-3">
            <div className="aspect-[4/5] rounded-2xl bg-surface-2" />
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 w-[60px] rounded-lg bg-surface-2" />
              ))}
            </div>
          </div>
          <div className="animate-pulse space-y-4 pt-2">
            <div className="h-3 w-24 rounded bg-surface-2" />
            <div className="h-9 w-3/4 rounded bg-surface-2" />
            <div className="h-4 w-32 rounded bg-surface-2" />
            <div className="h-10 w-28 rounded bg-surface-2" />
            <div className="h-20 rounded bg-surface-2" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-14 rounded-md bg-surface-2" />
              ))}
            </div>
            <div className="h-12 rounded-full bg-surface-2" />
          </div>
        </div>
      </main>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (p === null) {
    return (
      <main className="flex flex-col items-center justify-center px-6 py-40 text-center">
        <p className="font-display text-7xl font-bold text-white/10">404</p>
        <p className="mt-4 text-muted">Product not found.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
        >
          Back to shop
        </Link>
      </main>
    );
  }

  // ── Derived values (safe — p is a Product here) ───────────────────────────
  // Build per-color image list. For each color that has no matching image slot,
  // fall back to a deterministic picsum URL so the gallery always shows something
  // different when the user picks a different color.
  const rawImages = (p.images?.length ? p.images : [p.image]).filter(Boolean) as string[];
  const images = p.colors?.length
    ? p.colors.map((c, i) =>
        rawImages[i] ??
        `https://picsum.photos/seed/${p.slug || p.id}-${c.hex.replace("#", "")}/600/760`
      )
    : rawImages;
  const sizes       = p.sizes?.length ? p.sizes : DEFAULT_SIZES;
  const details     = (p.details ?? []) as string[];
  const tags        = (p.tags ?? []) as string[];
  const displayPrice = p.sale_price ?? p.price;
  const hasDiscount  = p.sale_price != null && p.sale_price < p.price;
  const discountPct  = hasDiscount ? Math.round((1 - displayPrice / p.price) * 100) : 0;
  const isWished     = has(p.id);
  const isWearable   = WEARABLE_CATS.includes(p.category);
  const viewerColor  = selColor ?? p.colors?.[0]?.hex ?? p.color;

  const colorObj = p.colors?.find((c) => c.hex === selColor);
  const handleAdd = () => {
    for (let i = 0; i < qty; i++)
      add(p, size ?? undefined, colorObj?.name, selColor ?? undefined);
  };
  const handleColorSelect = (hex: string) => {
    setSelColor(hex);
    const idx = p.colors?.findIndex((c) => c.hex === hex) ?? 0;
    setColorImageIdx(idx);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <motion.main
        className="mx-auto max-w-5xl px-6 pb-32 pt-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* ── Breadcrumbs ───────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1 text-xs text-muted">
          <Link to="/" className="transition-colors hover:text-white">Home</Link>
          {p.department && (
            <>
              <ChevronRight size={11} className="shrink-0" />
              <Link
                to={`/shop?department=${encodeURIComponent(p.department)}`}
                className="transition-colors hover:text-white"
              >
                {p.department}
              </Link>
            </>
          )}
          {p.category && (
            <>
              <ChevronRight size={11} className="shrink-0" />
              <Link
                to={`/shop?department=${encodeURIComponent(p.department)}&category=${encodeURIComponent(p.category)}`}
                className="transition-colors hover:text-white"
              >
                {p.category}
              </Link>
            </>
          )}
          {p.subcategory && (
            <>
              <ChevronRight size={11} className="shrink-0" />
              <Link
                to={`/shop?department=${encodeURIComponent(p.department)}&category=${encodeURIComponent(p.category)}&subcategory=${encodeURIComponent(p.subcategory)}`}
                className="transition-colors hover:text-white"
              >
                {p.subcategory}
              </Link>
            </>
          )}
          <ChevronRight size={11} className="shrink-0" />
          <span className="line-clamp-1 text-white/80">{p.name}</span>
        </nav>

        {/* ── 2-column main layout ──────────────────────────────────────── */}
        <div className="grid gap-10 md:grid-cols-2">

          {/* ── LEFT: media panel ───────────────────────────────────────── */}
          <div>
            {/* Photo / 3D toggle — only for shirt-shaped categories */}
            {isWearable && (
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
            )}

            {mediaTab === "photo" || !isWearable ? (
              <ImageGallery
              key={p.id}
              images={images}
              name={p.name}
              activeIndex={colorImageIdx}
              onIndexChange={setColorImageIdx}
            />
            ) : (
              // Canvas is only created when this branch renders — one WebGL context
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900">
                <Viewer3D color={viewerColor} />
              </div>
            )}
          </div>

          {/* ── RIGHT: product details ───────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Brand / category / name / rating */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                {p.brand}&ensp;·&ensp;{p.subcategory || p.category}
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
                  <span className="text-lg text-muted line-through">
                    {fmtEGP(p.price)}
                  </span>
                  <span className="rounded-full bg-sale/15 px-2 py-0.5 text-xs font-bold text-sale">
                    −{discountPct}%
                  </span>
                </>
              )}
            </div>

            {/* Color dots */}
            {p.colors && p.colors.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                  Color —{" "}
                  <span className="font-normal normal-case tracking-normal text-white">
                    {p.colors.find((c) => c.hex === selColor)?.name ?? p.colors[0]?.name}
                  </span>
                </p>
                <div className="flex gap-2">
                  {p.colors.map((c) => (
                    <button
                      key={c.hex}
                      title={c.name}
                      onClick={() => handleColorSelect(c.hex)}
                      className={`h-7 w-7 rounded-full border-2 transition-all duration-200 ${
                        selColor === c.hex
                          ? "scale-110 border-white"
                          : "border-transparent opacity-60 hover:scale-105 hover:opacity-100"
                      }`}
                      style={{ background: c.hex }}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size chips */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                Size
                {size && (
                  <span className="ml-1.5 font-normal normal-case tracking-normal text-white">
                    — {size}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(size === s ? null : s)}
                    className={`rounded-md border px-3.5 py-2 text-sm font-medium transition-all ${
                      size === s
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border text-muted hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity stepper + Add to cart + Wishlist */}
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border border-border">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-white"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 select-none text-center text-sm font-semibold">
                  {qty}
                </span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(Math.max(p.stock, 1), q + 1))}
                  className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-white"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* ref here so IntersectionObserver can watch this button */}
              <button
                ref={addBtnRef}
                disabled={p.stock < 1}
                onClick={handleAdd}
                className="flex-1 rounded-full bg-accent py-3 text-sm font-bold tracking-wider text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {p.stock < 1 ? "Sold Out" : "Add to Cart"}
              </button>

              <button
                aria-label={isWished ? "Remove from wishlist" : "Save to wishlist"}
                onClick={() => toggleWish(p.id)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-all hover:border-accent"
              >
                <Heart
                  size={16}
                  className={isWished ? "fill-accent text-accent" : "text-muted"}
                />
              </button>
            </div>

            {/* Stock indicator */}
            <StockIndicator stock={p.stock} />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Free-shipping nudge */}
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-4 py-3">
              <Package size={15} className="shrink-0 text-muted" />
              <p className="text-sm text-muted">
                Free shipping on orders over{" "}
                <span className="font-semibold text-white">{fmtEGP(FREE_SHIPPING_USD)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Details / Shipping ──────────────────────── */}
        <div className="mt-14">
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === t ? "text-white" : "text-muted hover:text-white/70"
                }`}
              >
                {t}
                {/* layoutId makes the underline slide smoothly between tabs */}
                {activeTab === t && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content — AnimatePresence mode="wait" plays exit before enter */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="py-8"
            >
              {activeTab === "Description" && (
                <p className="max-w-2xl leading-relaxed text-muted">
                  {p.description || "No description available."}
                </p>
              )}

              {activeTab === "Details" && (
                <div className="max-w-2xl space-y-6">
                  {details.length > 0 && (
                    <ul className="space-y-2.5">
                      {details.map((d, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-muted">
                          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Product attributes grid */}
                  {(p.fit || p.fabric || p.season || p.collection) && (
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                      {[
                        ["Fit",        p.fit],
                        ["Fabric",     p.fabric],
                        ["Season",     p.season?.replace(/-/g, " ")],
                        ["Collection", p.collection],
                        ["Department", p.department],
                      ].filter(([, v]) => v).map(([label, val]) => (
                        <div key={label as string}>
                          <dt className="text-[10px] font-bold uppercase tracking-widest text-muted">
                            {label}
                          </dt>
                          <dd className="mt-0.5 text-sm capitalize text-white/80">{val}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {(p.materials || p.fabric) && !p.fit && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">
                        Materials
                      </p>
                      <p className="text-sm text-muted">{p.fabric || p.materials}</p>
                    </div>
                  )}
                  {p.care_instructions && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">
                        Care
                      </p>
                      <p className="text-sm text-muted">{p.care_instructions}</p>
                    </div>
                  )}
                  {details.length === 0 && !p.materials && !p.fabric && !p.fit && (
                    <p className="text-sm text-muted">No details available.</p>
                  )}
                </div>
              )}

              {activeTab === "Shipping & returns" && (
                <div className="max-w-2xl space-y-5 text-sm">
                  {[
                    {
                      title: "Standard Shipping",
                      body: "Free on orders over EGP 2,500 — otherwise EGP 75. Delivered in 2–5 business days.",
                    },
                    {
                      title: "Express Shipping",
                      body: "EGP 150. Delivered next business day. Select at checkout.",
                    },
                    {
                      title: "Returns",
                      body: "Free returns within 30 days. Items must be unworn with original tags attached.",
                    },
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

        {/* ── Related products ─────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-10 border-t border-border pt-12">
            <h2 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide">
              You may also like
            </h2>
            {/* Mobile: horizontal scroll. Desktop: 4-col grid. */}
            <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
              {related.slice(0, 8).map((r) => (
                <RelatedCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        )}
      </motion.main>

      {/* ── Sticky mobile add-to-cart bar ────────────────────────────────────
           Visible on mobile only (md:hidden) when the main Add button is not
           in the viewport. AnimatePresence animates it in/out from the bottom. */}
      <AnimatePresence>
        {sticky && p.stock > 0 && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
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
