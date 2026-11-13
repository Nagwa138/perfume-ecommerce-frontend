import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { getProducts, type Product } from "./api";
import ProductCard from "./ProductCard";
import RecentlyViewed from "./RecentlyViewed";

// ── Category tiles ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "Fragrance",  pt: "perfume",  accent: "#C8A951", desc: "Niche perfumes & luxury scents" },
  { label: "Skincare",   pt: "skincare", accent: "#a0c4b8", desc: "Serums, moisturisers & more" },
  { label: "Makeup",     pt: "makeup",   accent: "#d4a0a0", desc: "Complexion, lips & eyes" },
  { label: "Hair",       pt: "haircare", accent: "#b8a0d4", desc: "Cleanse, condition & style" },
  { label: "Body",       pt: "body",     accent: "#a0c4c8", desc: "Luxurious body rituals" },
];

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute right-1/4 top-2/3 h-[400px] w-[400px] rounded-full bg-accent/4 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <Sparkles size={12} />
            Luxury Beauty Destination
          </p>
          <h1 className="font-display text-6xl font-bold tracking-[0.04em] md:text-8xl lg:text-9xl">
            AURA
          </h1>
          <div className="gold-divider mx-auto my-5 w-32" />
          <p className="mx-auto max-w-md text-base leading-relaxed text-muted md:text-lg">
            Discover curated fragrances, skincare rituals and beauty essentials
            crafted for those who appreciate the extraordinary.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/shop"
            className="flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold tracking-wider text-white transition-all hover:bg-accent-2 hover:shadow-gold"
          >
            Shop All Beauty <ArrowRight size={15} />
          </Link>
          <Link
            to="/shop?product_type=perfume&sort=popular"
            className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold text-muted transition-colors hover:border-accent/50 hover:text-white"
          >
            Explore Fragrances
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── Category tiles ─────────────────────────────────────────────────────────────

function CategoryTiles() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <h2 className="mb-8 text-center font-display text-3xl font-bold tracking-wide">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.pt}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <Link
              to={`/shop?product_type=${cat.pt}`}
              className="group block rounded-2xl border border-border bg-surface-2 p-6 text-center transition-all hover:border-accent/40"
              style={{ "--cat-color": cat.accent } as React.CSSProperties}
            >
              <div
                className="mx-auto mb-3 h-14 w-14 rounded-full"
                style={{ background: `${cat.accent}22`, boxShadow: `0 0 24px ${cat.accent}18` }}
              />
              <p className="font-display text-lg font-bold tracking-wide group-hover:text-accent transition-colors">
                {cat.label}
              </p>
              <p className="mt-1 text-xs text-muted leading-relaxed">{cat.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Featured products ─────────────────────────────────────────────────────────

function FeaturedProducts({ products, title }: { products: Product[]; title: string }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold tracking-wide">{title}</h2>
        <Link
          to="/shop?sort=popular"
          className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}

// ── Fragrance highlight ───────────────────────────────────────────────────────

function FragranceHighlight({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Signature Scents</p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-wide">New in Fragrance</h2>
          </div>
          <Link
            to="/shop?product_type=perfume&sort=newest"
            className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

// ── Gift sets banner ──────────────────────────────────────────────────────────

function GiftBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-2 px-8 py-14 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-accent/8 blur-[80px]" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 translate-y-1/2 rounded-full bg-accent/6 blur-[80px]" />
        </div>
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Limited Edition</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-wide md:text-5xl">
            Gift Sets & Collections
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Beautifully curated sets for every occasion. Free gift wrapping on all orders.
          </p>
          <Link
            to="/shop?collection=Gift+Sets"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-accent-2 hover:shadow-gold"
          >
            Explore Gift Sets <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Main home ──────────────────────────────────────────────────────────────────

export default function Home() {
  const [featured,  setFeatured]  = useState<Product[]>([]);
  const [newScents, setNewScents] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ sort: "popular", page_size: 8 }).then((d) => setFeatured(d.items));
    getProducts({ product_type: "perfume", sort: "newest", page_size: 4 }).then((d) => setNewScents(d.items));
  }, []);

  return (
    <>
      <Hero />
      <CategoryTiles />
      <FeaturedProducts products={featured} title="Best Sellers" />
      <FragranceHighlight products={newScents} />
      <GiftBanner />
      <RecentlyViewed />
    </>
  );
}
