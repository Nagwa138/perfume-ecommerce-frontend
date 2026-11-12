import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRecentlyViewed } from "./store";

export default function RecentlyViewed() {
  const products = useRecentlyViewed((s) => s.products);

  if (products.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-muted">
          Recently viewed
        </h3>

        <div className="flex gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="shrink-0"
            >
              <Link
                to={`/product/${p.slug || p.id}`}
                className="group block w-28 md:w-32"
              >
                <div className="relative overflow-hidden rounded-lg bg-surface-2 aspect-[4/5]">
                  <img
                    src={p.images?.[0] ?? p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-1.5 line-clamp-1 text-xs font-medium leading-snug">
                  {p.name}
                </p>
                <p className="text-xs text-muted">
                  ${(p.sale_price ?? p.price).toFixed(2)}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
