import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fmtEGP } from "./api";
import { useRecentlyViewed } from "./store";

export default function RecentlyViewed() {
  const products = useRecentlyViewed((s) => s.products);
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        
        {/* Header matching the rest of the site */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
              Just for you
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-wide md:text-4xl">
              Recently Viewed
            </h2>
          </div>
        </div>

        {/* 
          If 1-4 items: use a standard grid so they fill the space nicely.
          If 5+ items: use a horizontal scroll rail.
        */}
        {products.length < 5 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {products.map((p, i) => (
              <ProductCardItem key={p.id} p={p} i={i} />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((p, i) => (
              <div key={p.id} className="shrink-0 snap-start w-[240px] md:w-[280px]">
                <ProductCardItem p={p} i={i} />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

// Separated the card logic to keep the main render clean
function ProductCardItem({ p, i }: { p: any, i: number }) {
  const price = p.sale_price ?? (p.sizes?.[0]?.price ?? 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.05 }}
    >
      <Link to={`/product/${p.slug || p.id}`} className="group block">
        {/* Image container matches the luxury aspect ratio */}
        <div className="relative overflow-hidden rounded-xl bg-surface-2 aspect-[3/4]">
          {p.images?.[0] ? (
            <img
              src={p.images[0]}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-2xl font-bold text-white/5">H</span>
            </div>
          )}
        </div>
        
        {/* Info below image */}
        <div className="mt-3">
          <p className="line-clamp-1 text-sm font-medium leading-snug transition-colors group-hover:text-accent">
            {p.name}
          </p>
          <p className="mt-1 text-xs text-muted">
            {fmtEGP(price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}