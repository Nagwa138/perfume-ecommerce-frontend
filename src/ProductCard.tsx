import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import { fmtEGP, type Product } from "./api";
import { useCart, useWishlist, useRecentlyViewed } from "./store";
import { BRAND } from "./brand";

type Props = {
  product: Product;
  index?: number;
  onQuickView?: (p: Product) => void;
};

type BadgeVariant = "new" | "low" | "out" | "sale";

function Badge({ text, variant }: { text: string; variant: BadgeVariant }) {
  const cls: Record<BadgeVariant, string> = {
    new:  "bg-accent text-[color:var(--h-text-inv)]",
    low:  "bg-orange-500 text-white",
    out:  "bg-surface-2 text-muted",
    sale: "bg-sale text-white",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${cls[variant]}`}>
      {text}
    </span>
  );
}

function minPrice(p: Product): number {
  if (p.sale_price != null) return p.sale_price;
  const prices = (p.sizes ?? []).map((s) => s.price).filter(Boolean);
  return prices.length ? Math.min(...prices) : 0;
}

function origPrice(p: Product): number {
  const prices = (p.sizes ?? []).map((s) => s.price).filter(Boolean);
  return prices.length ? Math.min(...prices) : 0;
}

function totalStock(p: Product): number {
  return (p.sizes ?? []).reduce((sum, s) => sum + (s.stock ?? 0), 0);
}

function firstAvailableSize(p: Product): number {
  const sz = (p.sizes ?? []).find((s) => (s.stock ?? 0) > 0);
  return sz?.ml ?? (p.sizes?.[0]?.ml ?? 0);
}

export default function ProductCard({ product: p, index = 0, onQuickView }: Props) {
  const [imgErr, setImgErr] = useState(false);
  const [rippling, setRippling] = useState<string | null>(null);
  const add = useCart((s) => s.add);
  const { toggle: toggleWish, has } = useWishlist();
  const track = useRecentlyViewed((s) => s.track);
  const wished = has(p.id);

  const imgSrc = imgErr
    ? `https://placehold.co/600x800/0e0e10/333333?text=${encodeURIComponent(p.name.slice(0, 12))}`
    : (p.images?.[0] ?? "");

  const displayPrice = minPrice(p);
  const hasDiscount  = p.sale_price != null && p.sale_price < origPrice(p);
  const stock        = totalStock(p);

  const badge: { text: string; variant: BadgeVariant } | null =
    stock === 0
      ? { text: "Sold out", variant: "out" }
      : stock <= 5
      ? { text: `Only ${stock} left`, variant: "low" }
      : hasDiscount
      ? { text: "Sale", variant: "sale" }
      : p.is_new
      ? { text: "New", variant: "new" }
      : null;

  // Makeup shade swatches (up to 5)
  const shades = p.product_type === "makeup" ? (p.variants ?? []).slice(0, 5) : [];

  const handleSwatchClick = (name: string) => {
    setRippling(name);
    setTimeout(() => setRippling(null), 500);
  };

  return (
    <motion.div
      className="group flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: Math.min(index * 0.05, 0.3) }}
    >
      {/* Image Area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface-2 border border-border/50 group-hover:border-accent/40 transition-colors duration-500">

        {/* Gold Shimmer overlay */}
        <div className="absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none shimmer-text mix-blend-overlay" />

        {imgSrc ? (
          <img
            src={imgSrc}
            alt={p.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgErr(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-5xl font-bold tracking-widest text-white/5">{BRAND.nameUpper}</span>
          </div>
        )}

        {/* Link overlay */}
        <Link
          to={`/product/${p.slug || p.id}`}
          className="absolute inset-0 z-[2]"
          aria-label={p.name}
          onClick={() => track(p)}
        />

        {/* Badges */}
        {badge && (
          <div className="absolute left-3 top-3 z-10">
            <Badge {...badge} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            onClick={(e) => { e.preventDefault(); toggleWish(p.id); }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-all hover:bg-accent hover:text-[color:var(--h-text-inv)]"
          >
            <Heart size={14} className={wished ? "fill-current" : ""} />
          </button>

          {onQuickView && (
            <button
              aria-label="Quick view"
              onClick={(e) => { e.preventDefault(); onQuickView(p); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-all opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 duration-300 hover:bg-white hover:text-black"
            >
              <Eye size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Info Area (Below image) */}
      <div className="flex flex-1 flex-col pt-3 pb-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            {p.brand}
          </span>
          {shades.length > 0 && (
            <div className="flex gap-1.5">
              {shades.map((sv) => (
                <button
                  key={sv.name}
                  onClick={() => handleSwatchClick(sv.name)}
                  title={sv.name}
                  className={`h-3 w-3 rounded-full border border-border shadow-sm swatch-ripple ${rippling === sv.name ? "active" : ""}`}
                  style={{ background: sv.shade_hex, color: sv.shade_hex }}
                />
              ))}
            </div>
          )}
        </div>

        <Link to={`/product/${p.slug || p.id}`} className="group-hover:text-accent transition-colors">
          <h3 className="font-display text-lg font-medium leading-tight line-clamp-2">
            {p.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${hasDiscount ? "text-sale" : "text-text"}`}>
              {fmtEGP(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-muted line-through -mt-0.5">{fmtEGP(origPrice(p))}</span>
            )}
          </div>

          <button
            disabled={stock < 1}
            onClick={() => add(p, firstAvailableSize(p))}
            className="
              rounded-full border border-border px-3.5 py-1.5 text-[11px] font-bold tracking-wider
              transition-all duration-300 disabled:opacity-40
              hover:bg-accent hover:text-[color:var(--h-text-inv)] hover:border-accent
            "
          >
            ADD
          </button>
        </div>
      </div>
    </motion.div>
  );
}