import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { getProducts, getTopReviews, type Product, type TopReview } from "./api";
import ProductCard from "./ProductCard";
import RitualFinder from "./features/ritual-finder";
import { BRAND } from "./brand";
import Logo from "./components/Logo";

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: "linear-gradient(160deg, #0F2A24 0%, #0a1f1a 50%, #060f0d 100%)" }}
    >
      {/* Subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>\")",
        }}
        aria-hidden
      />

      {/* Radial glow behind wordmark */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 42%, rgba(185,142,60,0.12) 0%, transparent 70%)" }}
        aria-hidden
      />

      {/* Top rule */}
      <div className="mb-10 flex items-center gap-4" aria-hidden>
        <span className="h-px w-16 md:w-28 bg-gradient-to-r from-transparent to-[var(--color-highlight)]/60" />
        <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-[var(--color-highlight)]/70">
          Est. 2026 · Heliopolis
        </span>
        <span className="h-px w-16 md:w-28 bg-gradient-to-l from-transparent to-[var(--color-highlight)]/60" />
      </div>

      {/* Wordmark */}
      <h1 className="leading-none">
        <Logo variant="light" className="text-[clamp(4rem,18vw,12rem)]" />
      </h1>

      {/* Shimmer line */}
      <div
        className="mt-6 h-px w-48 md:w-80"
        style={{ background: "linear-gradient(90deg, transparent, var(--color-highlight), transparent)" }}
        aria-hidden
      />

      {/* Tagline */}
      <p className="mt-6 font-display italic text-lg md:text-xl text-white/65 max-w-sm">
        {BRAND.tagline}
      </p>

      {/* Arabic tagline */}
      <p className="mt-2 font-arabic text-sm text-white/40" dir="rtl">
        {BRAND.taglineAr}
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/shop"
          className="rounded-full px-10 py-3.5 text-sm font-bold uppercase tracking-[0.22em] text-[var(--color-ink)] transition-all hover:opacity-90 hover:-translate-y-px"
          style={{ background: "linear-gradient(135deg, #e8d5a0 0%, #c9a24a 50%, #a07830 100%)" }}
        >
          Enter the store
        </Link>
        <a
          href="#first-section"
          className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-white/70 transition-colors hover:border-[var(--color-highlight)]/60 hover:text-white"
        >
          Discover
        </a>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30" aria-hidden>
        <span className="text-[9px] uppercase tracking-[0.4em]">Scroll</span>
        <span className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
}

// ── Section 4: Category gateway ───────────────────────────────────────────────

const CATEGORIES = [
  { label: "Fragrance",   sub: "The scent library",    href: "/shop?product_type=perfume",   img: "https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=600&auto=format&fit=crop" },
  { label: "Skincare",    sub: "Daily care",            href: "/shop?product_type=skincare",   img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600&auto=format&fit=crop" },
  { label: "Makeup",      sub: "Color, kept",           href: "/shop?product_type=makeup",     img: "https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?q=80&w=600&auto=format&fit=crop" },
  { label: "Hair",        sub: "Crowns",                href: "/shop?product_type=haircare",   img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop" },
  { label: "Body & Bath", sub: "The hammam at home",   href: "/shop?product_type=body",       img: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?q=80&w=600&auto=format&fit=crop" },
  { label: "Gifts",       sub: "The art of giving",    href: "/shop?product_type=gift",       img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop" },
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
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [reviews,     setReviews]     = useState<TopReview[]>([]);

  useEffect(() => {
    getProducts({ sort: "popular", page_size: 6 }).then((d) => setBestsellers(d.items));
    getTopReviews(9).then(setReviews);
  }, []);

  return (
    <div className="bg-[var(--color-bg)] min-h-screen text-[var(--color-ink)] overflow-x-hidden">

      {/* 1 — Hero */}
      <Hero />

      {/* 2 — Tagline strip */}
      <section id="first-section" className="w-full bg-[var(--color-surface)] flex items-center justify-center py-12">
        <div className="text-center px-4">
          <p className="font-display italic text-2xl md:text-3xl text-[var(--color-ink)]">
            Cairo's destination for niche and designer fragrance.
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)]">
            HELIOPOLIS · CAIRO
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
            THE STORE
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-[var(--color-ink)] mb-12">
            Shop the collection.
          </h2>

          {/* 3 + 3 grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
            {CATEGORIES.slice(0, 3).map((cat) => (
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
            {CATEGORIES.slice(3).map((cat) => (
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

      {/* 5 — Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="bg-[var(--color-surface)] py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-4 md:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)] mb-3">
              WHAT THE STORE IS WEARING
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

      {/* 6 — Reviews wall */}
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

      {/* 7 — Gift sets / sampler CTA */}
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

    </div>
  );
}
