import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { getProducts, getTopReviews, type Product, type TopReview } from "./api";
import ProductCard from "./ProductCard";
import StreetHero from "./hero/StreetHero";
import RitualFinder from "./features/ritual-finder";

// ── Section 4: Category gateway ───────────────────────────────────────────────

const CATEGORIES = [
  { label: "Fragrance",   sub: "The scent library",    href: "/shop?product_type=perfume",   img: "https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=600&auto=format&fit=crop" },
  { label: "Skincare",    sub: "Daily care",            href: "/shop?product_type=skincare",   img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600&auto=format&fit=crop" },
  { label: "Makeup",      sub: "Color, kept",           href: "/shop?product_type=makeup",     img: "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?q=80&w=600&auto=format&fit=crop" },
  { label: "Hair",        sub: "Crowns",                href: "/shop?product_type=haircare",   img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop" },
  { label: "Body & Bath", sub: "The hammam at home",   href: "/shop?product_type=body",       img: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?q=80&w=600&auto=format&fit=crop" },
  { label: "Gifts",       sub: "The art of giving",    href: "/shop?product_type=gift",       img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop" },
  { label: "Pharmacy",    sub: "The counter",          href: "/shop?product_type=pharmacy",   img: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=600&auto=format&fit=crop" },
];

// ── Section 7: Reviews wall ───────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? "fill-[var(--color-highlight)] text-[var(--color-highlight)]" : "text-[var(--color-line)]"}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Home() {
  const [bestsellers,   setBestsellers]   = useState<Product[]>([]);
  const [pharmProducts, setPharmProducts] = useState<Product[]>([]);
  const [reviews,       setReviews]       = useState<TopReview[]>([]);

  useEffect(() => {
    getProducts({ sort: "popular", page_size: 6 }).then((d) => setBestsellers(d.items));
    getProducts({ product_type: "pharmacy", page_size: 6 }).then((d) => setPharmProducts(d.items));
    getTopReviews(9).then(setReviews);
  }, []);

  return (
    <div className="bg-[var(--color-bg)] min-h-screen text-[var(--color-ink)] overflow-x-hidden">

      {/* 1 — 3D Street Hero */}
      <StreetHero />

      {/* 2 — Tagline strip */}
      <section id="first-section" className="w-full bg-[var(--color-surface)] flex items-center justify-center py-12">
        <div className="text-center px-4">
          <p className="font-display italic text-2xl md:text-3xl text-[var(--color-ink)]">
            "A new house. An old ritual."
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)]">
            EST. 2026 · ROOTED IN THE REGION
          </p>
        </div>
      </section>

      {/* 3 — Ritual Finder */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-20 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)] mb-3">
          THE RITUAL FINDER
        </p>
        <h2 className="font-display text-3xl md:text-5xl text-[var(--color-ink)] mb-3">
          Tell us how you take care.
        </h2>
        <p className="text-sm text-[var(--color-ink-soft)] mb-12 max-w-sm">
          Four questions. One curated ritual.
        </p>
        <RitualFinder />
      </section>

      {/* 4 — Category gateway */}
      <section className="bg-[var(--color-surface-2)] py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)] mb-3">
            THE HOUSE
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-[var(--color-ink)] mb-12">
            Seven ways in.
          </h2>

          {/* 4 + 3 grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
            {CATEGORIES.slice(0, 4).map((cat) => (
              <Link
                key={cat.label}
                to={cat.href}
                className="group relative overflow-hidden rounded-xl aspect-[3/4] block"
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[var(--color-ink)]/30 group-hover:bg-[var(--color-ink)]/40 transition-colors" />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="font-display text-lg text-white leading-tight">{cat.label}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 mt-0.5">
                    {cat.sub}
                  </p>
                  <span className="mt-2 block w-6 h-0.5 bg-[var(--color-highlight)] transition-all duration-300 group-hover:w-10" />
                </div>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {CATEGORIES.slice(4).map((cat) => (
              <Link
                key={cat.label}
                to={cat.href}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] md:aspect-[3/2] block"
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[var(--color-ink)]/30 group-hover:bg-[var(--color-ink)]/40 transition-colors" />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="font-display text-lg text-white leading-tight">{cat.label}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 mt-0.5">
                    {cat.sub}
                  </p>
                  <span className="mt-2 block w-6 h-0.5 bg-[var(--color-highlight)] transition-all duration-300 group-hover:w-10" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Pharmacist's counter */}
      {pharmProducts.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-20 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)] mb-3">
            THE PHARMACIST'S COUNTER
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-[var(--color-ink)] mb-3">
            Beauty, with a clinical spine.
          </h2>
          <p className="text-sm text-[var(--color-ink-soft)] mb-12 max-w-lg">
            A short shelf of functional products, chosen with pharmacists. Retinol, SPF, actives — the unglamorous essentials that make the rest work.
          </p>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {pharmProducts.map((p, i) => (
              <div key={p.id} className="w-[180px] md:w-[220px] shrink-0">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/shop?product_type=pharmacy"
              className="inline-flex items-center text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors gap-1"
            >
              Visit the counter →
            </Link>
          </div>
        </section>
      )}

      {/* 6 — Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="bg-[var(--color-surface)] py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-4 md:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)] mb-3">
              WHAT THE HOUSE IS WEARING
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-[var(--color-ink)] mb-12">
              This month's shelf.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {bestsellers.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7 — Reviews wall */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-20 md:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)] mb-3">
            WHAT THEY'RE SAYING
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-[var(--color-ink)] mb-12">
            Rituals, reviewed.
          </h2>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {reviews.map((rv) => (
              <div
                key={rv.id}
                className="break-inside-avoid mb-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
              >
                <StarRow rating={rv.rating} />
                {rv.title && (
                  <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">{rv.title}</p>
                )}
                <p className="mt-2 font-display italic text-base text-[var(--color-ink-soft)] leading-relaxed">
                  "{rv.body}"
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-[var(--color-ink-muted)]">{rv.author.split(" ")[0]} {rv.author.split(" ")[1]?.[0] ?? ""}.</p>
                  <Link
                    to={`/product/${rv.product_slug}`}
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-accent)] hover:underline"
                  >
                    {rv.product_name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8 — Gift sets / sampler CTA */}
      <section className="bg-[var(--color-surface-2)] py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)] mb-3">
            THE ART OF GIVING
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-[var(--color-ink)] mb-12">
            For someone who takes care.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/shop?product_type=gift"
              className="group relative overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-line)] p-10 flex flex-col justify-between min-h-[280px] hover:border-[var(--color-accent)] transition-colors"
            >
              <div>
                <p className="font-display text-2xl md:text-3xl text-[var(--color-ink)] mb-2">Discovery set</p>
                <p className="text-sm text-[var(--color-ink-soft)]">Five samples. One decision.</p>
              </div>
              <span className="inline-flex items-center text-sm font-semibold text-[var(--color-accent)] mt-6">
                Explore sets →
              </span>
            </Link>
            <Link
              to="/shop?product_type=gift"
              className="group relative overflow-hidden rounded-2xl bg-[var(--color-accent)] p-10 flex flex-col justify-between min-h-[280px]"
            >
              <div>
                <p className="font-display text-2xl md:text-3xl text-[var(--color-accent-contrast)] mb-2">The gift box</p>
                <p className="text-sm text-[var(--color-accent-contrast)]/80">Curated by us, wrapped in linen.</p>
              </div>
              <span className="inline-flex items-center text-sm font-semibold text-[var(--color-accent-contrast)] mt-6">
                Shop gift boxes →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 9 — Editorial note */}
      <section className="mx-auto max-w-[680px] px-4 md:px-8 py-24 md:py-32 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)] mb-8">
          A NOTE FROM THE HOUSE
        </p>
        <p className="font-display italic text-lg md:text-xl text-[var(--color-ink)] leading-relaxed mb-6">
          We built Hossam because the beauty we grew up with — the oud on a grandmother's wrist, the rose water on a hot afternoon, the kohl line that never smudged — deserved its own house. Not a translation. Not a tribute. A house.
        </p>
        <p className="font-display italic text-lg md:text-xl text-[var(--color-ink-soft)] leading-relaxed">
          Everything you'll find here is chosen the way we'd choose for ourselves. Quietly, carefully, and with a bias toward things that actually work.
        </p>
      </section>

    </div>
  );
}
