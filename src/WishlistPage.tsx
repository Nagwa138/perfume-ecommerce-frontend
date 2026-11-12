import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { getProduct, type Product } from "./api";
import { useWishlist } from "./store";
import ProductCard from "./ProductCard";
import QuickView from "./QuickView";
import { useTitle } from "./hooks/useTitle";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qv, setQv] = useState<Product | null>(null);

  useTitle("Wishlist");

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      setProducts([]);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => getProduct(String(id)))).then((results) => {
      setProducts(results.filter(Boolean) as Product[]);
      setLoading(false);
    });
  }, [ids]);

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">Your</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Wishlist
        </h1>
        <p className="mt-2 text-sm text-muted">
          {loading
            ? "Loading…"
            : `${products.length} saved item${products.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 md:px-6">
        {!loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <Heart size={48} className="text-zinc-700" />
            <p className="mt-4 font-semibold text-zinc-400">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-zinc-500">
              Save items you love by tapping the heart icon.
            </p>
            <Link
              to="/shop"
              className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-surface-2 aspect-[3/4]"
                  />
                ))
              : products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} onQuickView={setQv} />
                ))}
          </div>
        )}
      </div>

      <QuickView product={qv} onClose={() => setQv(null)} />
    </>
  );
}
