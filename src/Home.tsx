import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Lock } from "lucide-react";
import { getProducts, type Product } from "./api";
import ProductCard from "./ProductCard";
import RecentlyViewed from "./RecentlyViewed";

const StreetHero = lazy(() => import("./hero/StreetHero"));

const CATEGORIES = [
  { label: "Fragrance",  pt: "perfume",   accent: "#D9B979", desc: "Niche perfumes & luxury scents" },
  { label: "Skincare",   pt: "skincare",  accent: "#A8C8B8", desc: "Serums, moisturisers & rituals" },
  { label: "Makeup",     pt: "makeup",    accent: "#D8A18B", desc: "Complexion, lips & eyes" },
  { label: "Hair",       pt: "haircare",  accent: "#B8A0D4", desc: "Cleanse, condition & style" },
  { label: "Body",       pt: "body",      accent: "#A0C4C8", desc: "Luxurious body rituals" },
  { label: "Pharmacy",   pt: "pharmacy-wellness", accent: "#7EC8A0", desc: "Wellness & daily care" },
];

function CategoryTiles() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <div className="mb-10 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Discover</p>
        <h2 className="mt-2 font-display text-4xl font-medium tracking-wide md:text-5xl">
          Shop by Category
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.pt}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <Link
              to={`/shop?product_type=${cat.pt}`}
              className="group block rounded-2xl border border-border bg-surface-2 p-6 text-center transition-all hover:border-accent/40 hover:-translate-y-1"
            >
              <div
                className="mx-auto mb-4 h-14 w-14 rounded-full transition-all group-hover:scale-110"
                style={{ background: `${cat.accent}22`, boxShadow: `0 0 24px ${cat.accent}18` }}
              />
              <p className="font-display text-lg font-semibold tracking-wide transition-colors group-hover:text-accent">
                {cat.label}
              </p>
              <p className="mt-1 text-[11px] text-muted leading-relaxed">{cat.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function NewArrivalsRail({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Just arrived</p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-wide md:text-4xl">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-accent"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
          {products.map((p, i) => (
            <div key={p.id} className="w-[240px] shrink-0 snap-start md:w-[280px]">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialBlock() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="order-2 md:order-1"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">The Ritual</p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-wide md:text-5xl">
            Beauty is an <span className="italic text-accent">everyday</span> ceremony.
          </h2>
          <div className="gold-divider my-6 w-24" />
          <p className="text-sm leading-relaxed text-muted md:text-base">
            HOSSAM curates the world's finest fragrance, skincare, and wellness — chosen for their craft, their scent, and the way they make you feel. Every bottle is a small ritual. Every morning, a chance to begin again.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-text transition-all hover:border-accent hover:text-accent"
          >
            Explore the collection <ArrowRight size={14} />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="order-1 md:order-2"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface-2">
            <div className="absolute inset-0 mesh-bg opacity-60" />
            <div className="absolute inset-0 flex items-end p-8">
              <div>
                <p className="font-display text-3xl text-text">Autumn 2026</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted">The signature edit</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Bestsellers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Loved by many</p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-wide md:text-4xl">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?sort=popular"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-accent"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function QuizBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-2 px-8 py-14 text-center md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-[100px]" />
        </div>
        <div className="relative">
          <Sparkles size={22} className="mx-auto text-accent" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Personalised</p>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-wide md:text-4xl">
            Find your signature scent
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
            Answer a few questions and we'll match you with fragrances you'll love.
          </p>
          <Link
            to="/quiz/fragrance"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[color:var(--h-text-inv)] transition-all hover:bg-accent-2"
          >
            Take the quiz <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function GiftBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-2">
        <div className="p-10 md:p-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Limited edition</p>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-wide md:text-5xl">
            Gift Sets & Collections
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Beautifully curated sets for every occasion. Free gift wrapping on all orders.
          </p>
          <Link
            to="/shop?collection=Gift+Sets"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[color:var(--h-text-inv)] transition-all hover:bg-accent-2"
          >
            Explore Gift Sets <ArrowRight size={14} />
          </Link>
        </div>
        <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
          <div className="absolute inset-0 mesh-bg" />
        </div>
      </div>
    </section>
  );
}

function BenefitsStrip() {
  const items = [
    { icon: Truck,       title: "Free delivery",     sub: "On orders over EGP 500" },
    { icon: ShieldCheck, title: "100% authentic",    sub: "Sourced with care" },
    { icon: Lock,        title: "Secure payment",    sub: "Encrypted checkout" },
  ];
  return (
    <section className="border-y border-border bg-surface py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-3 md:px-6">
        {items.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/5">
              <Icon size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text">{title}</p>
              <p className="text-[11px] text-muted">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">The list</p>
        <h2 className="mt-3 font-display text-3xl font-medium tracking-wide md:text-4xl">
          Join the HOSSAM circle
        </h2>
        <p className="mt-3 text-sm text-muted">
          New arrivals, exclusive offers, and the occasional love letter. No noise.
        </p>
        <form
          className="mt-8 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            required
            placeholder="your@email.com"
            className="flex-1 rounded-full border border-border bg-surface px-5 py-3 text-sm text-text outline-none placeholder:text-muted focus:border-accent transition-colors"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-8 py-3 text-xs font-bold uppercase tracking-widest text-[color:var(--h-text-inv)] transition-colors hover:bg-accent-2"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default function Home() {
  const [featured,  setFeatured]  = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ sort: "popular", page_size: 8 }).then((d) => setFeatured(d.items));
    getProducts({ sort: "newest", page_size: 8 }).then((d) => setNewArrivals(d.items));
  }, []);

  return (
    <>
      <Suspense fallback={<div className="h-screen border-b border-border bg-bg" />}>
        <StreetHero />
      </Suspense>
      <div id="first-section">
        <CategoryTiles />
      </div>
      <NewArrivalsRail products={newArrivals} />
      <EditorialBlock />
      <Bestsellers products={featured} />
      <QuizBanner />
      <GiftBanner />
      <BenefitsStrip />
      <Newsletter />
      <RecentlyViewed />
    </>
  );
}