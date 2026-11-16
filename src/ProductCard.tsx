import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { fmtEGP, type Product } from "./api";
import { useWishlist, useRecentlyViewed } from "./store";

type Props = {
  product: Product;
  index?: number;
  onQuickView?: (p: Product) => void; // <-- Added to fix the TS2322 error
};

export default function ProductCard({ product: p, onQuickView }: Props) {
  const [imgErr, setImgErr] = useState(false);
  const { toggle: toggleWish, has } = useWishlist();
  const track = useRecentlyViewed((s) => s.track);
  const wished = has(p.id);

  const imgSrc = imgErr
    ? `https://placehold.co/600x800/f5f5f5/cccccc?text=No+Image`
    : (p.images?.[0] ?? "");

  const displayPrice = p.sale_price ?? (p.sizes?.[0]?.price ?? 0);
  const origPrice = p.sizes?.[0]?.price ?? 0;
  const hasDiscount = p.sale_price != null && p.sale_price < origPrice;
  
  // Calculate percentage for the badge
  const discountPercent = hasDiscount ? Math.round(((origPrice - p.sale_price!) / origPrice) * 100) : 0;

  return (
    <div className="group flex flex-col bg-white">
      
      {/* Image Area */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-[#FAFAFA]">
        
        {/* Discount Badge - Scales down on mobile */}
        {hasDiscount && (
          <div className="absolute left-2 top-2 z-10 bg-[#D9385E] text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded">
            Save {discountPercent}%
          </div>
        )}

        {imgSrc ? (
          <img
            src={imgSrc}
            alt={p.name}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-xs md:text-sm">No Image</span>
          </div>
        )}

        {/* Wishlist Button - Smaller on mobile */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWish(p.id); }}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white text-gray-600 shadow-sm"
        >
          <Heart size={14} className={`md:w-4 md:h-4 ${wished ? "fill-[#D9385E] text-[#D9385E]" : ""}`} />
        </button>

        {/* Link Overlay */}
        <Link
          to={`/product/${p.slug || p.id}`}
          className="absolute inset-0 z-0"
          onClick={() => track(p)}
        />
      </div>

      {/* Info Area - Fluid text sizes */}
      <div className="flex flex-1 flex-col pt-2 md:pt-3">
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5 md:mb-1">
          {p.brand}
        </span>
        <Link to={`/product/${p.slug || p.id}`} className="hover:underline">
          <h3 className="text-xs md:text-sm font-medium leading-snug line-clamp-2 text-black">
            {p.name}
          </h3>
        </Link>
        
        <div className="mt-1.5 md:mt-2 flex items-baseline flex-wrap gap-1.5 md:gap-2">
          <span className={`text-xs md:text-sm font-bold ${hasDiscount ? "text-[#D9385E]" : "text-black"}`}>
            {fmtEGP(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through">
              {fmtEGP(origPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}