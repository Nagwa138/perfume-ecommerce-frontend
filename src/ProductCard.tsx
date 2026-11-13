import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import { fmtEGP, type Product } from "./api";
import { useCart, useWishlist, useRecentlyViewed } from "./store";
import { BRAND } from "./brand";

type Props = {
  product: Product;
  featured?: boolean;
  index?: number;
  onQuickView?: (p: Product) => void;
};

type BadgeVariant = "new" | "low" | "out" | "sale";

function Badge({ text, variant }: { text: string; variant: BadgeVariant }) {
  const cls: Record<BadgeVariant, string> = {
    new:  "bg-accent text-white",
    low:  "bg-orange-500 text-white",
    out:  "bg-zinc-800 text-white/50",
    sale: "bg-sale/80 text-white",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls[variant]}`}>
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

export default function ProductCard({ product: p, featured = false, index = 0, onQuickView }: Props) {
  const [imgErr, setImgErr] = useState(false);
  const add = useCart((s) => s.add);
  const { toggle: toggleWish, has } = useWishlist();
  const track = useRecentlyViewed((s) => s.track);
  const wished = has(p.id);

  const imgSrc = imgErr
    ? `https://placehold.co/600x750/0e0e10/333333?text=${encodeURIComponent(p.name.slice(0, 12))}`
    : (p.images?.[0] ?? "");

  const displayPrice = minPrice(p);
  const hasDiscount  = p.sale_price != null && p.sale_price < origPrice(p);
  const stock        = totalStock(p);
  const isFragrance  = p.product_type === "perfume";
  const glowColor    = isFragrance ? p.bottle_color : null;

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

  return (
    <motion.div
      className={`group relative ${featured ? "col-span-2 row-span-2 aspect-[2/3]" : "aspect-[3/4]"}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.48, ease: "easeOut", delay: Math.min(index * 0.055, 0.35) }}
    >
      <div className="relative h-full overflow-hidden rounded-xl bg-surface-2">
        {/* Image */}
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={p.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgErr(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-2">
            <span className="font-display text-5xl font-bold tracking-widest text-white/10">{BRAND.nameUpper}</span>
          </div>
        )}

        {/* Overlay link */}
        <Link
          to={`/product/${p.slug || p.id}`}
          className="absolute inset-0 z-[1]"
          aria-label={p.name}
          onClick={() => track(p)}
        />

        {/* Gradient */}
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {/* Gold glow ring for fragrances */}
        <div
          className="pointer-events-none absolute inset-0 z-[2] rounded-xl transition-shadow duration-300 group-hover:shadow-[inset_0_0_0_1.5px_rgba(200,169,81,0.5)]"
          style={glowColor ? { "--glow": glowColor } as React.CSSProperties : undefined}
        />

        {/* Badges */}
        {badge && (
          <div className="absolute left-3 top-3 z-10">
            <Badge {...badge} />
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            onClick={(e) => { e.preventDefault(); toggleWish(p.id); }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm transition-all hover:bg-accent hover:scale-110"
          >
            <Heart size={14} className={wished ? "fill-white text-white" : "text-white/80"} />
          </button>

          {onQuickView && (
            <button
              aria-label="Quick view"
              onClick={(e) => { e.preventDefault(); onQuickView(p); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm transition-all hover:bg-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 duration-200"
            >
              <Eye size={14} className="text-white/80 group-hover:text-black" />
            </button>
          )}
        </div>

        {/* Bottom overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] p-3.5 md:p-4">

          {/* Brand + category */}
          <div className="mb-0.5 flex items-center gap-1.5">
            {shades.length > 0 && (
              <div className="flex gap-1">
                {shades.map((sv) => (
                  <span
                    key={sv.shade_hex}
                    className="h-2.5 w-2.5 rounded-full border border-white/25"
                    style={{ background: sv.shade_hex }}
                    title={sv.name}
                  />
                ))}
              </div>
            )}
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">
              {p.brand}
            </span>
          </div>

          <p className="font-semibold leading-snug text-white line-clamp-1">{p.name}</p>

          {/* Price row + quick-add */}
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-sm font-bold ${hasDiscount ? "text-sale" : "text-white"}`}>
                {fmtEGP(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-white/40 line-through">{fmtEGP(origPrice(p))}</span>
              )}
            </div>

            <button
              disabled={stock < 1}
              onClick={(e) => { e.preventDefault(); add(p, firstAvailableSize(p)); }}
              className="
                pointer-events-auto rounded-full bg-accent px-3 py-1 text-[11px] font-bold
                tracking-wider text-white transition-all duration-200 disabled:opacity-40
                opacity-100 translate-y-0
                md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0
              "
            >
              + ADD
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
