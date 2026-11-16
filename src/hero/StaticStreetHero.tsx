// src/hero/StaticStreetHero.tsx
// Shared fallback for: reduced-motion, no WebGL, lost WebGL context.
// No three.js import — cheap, always safe.
import { Link } from "react-router-dom";
import { BRAND } from "../brand";
import { BEATS } from "./types";

export default function StaticStreetHero() {
  return (
    <section
      className="relative flex min-h-screen w-full flex-col justify-end overflow-hidden border-b border-border"
      style={{
        background:
          "linear-gradient(to bottom, #2a1f1a 0%, #3a2418 35%, #0b0a14 100%)",
      }}
    >
      {/* Storefront silhouettes */}
      <div className="pointer-events-none absolute inset-x-0 bottom-32 flex justify-around px-6 opacity-70">
        {BEATS.map((b) => (
          <div key={b.id} className="flex flex-col items-center gap-2">
            <div
              className="h-20 w-16 rounded-t-sm"
              style={{
                background: "#15131a",
                boxShadow: `inset 0 0 12px ${b.color}66`,
              }}
            />
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: b.color }}
            >
              {b.sign}
            </span>
          </div>
        ))}
      </div>

      {/* Fake road */}
      <div className="absolute bottom-0 left-1/2 h-28 w-[70vw] -translate-x-1/2 rounded-t-sm bg-[#14141a]" />
      <div className="absolute bottom-0 left-1/2 h-28 w-0.5 -translate-x-1/2 bg-white/15" />

      {/* Copy */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 text-center">
        <h1 className="font-display text-6xl font-black tracking-tight text-white sm:text-7xl md:text-8xl">
          {BRAND.nameUpper}
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.3em] text-white/50">
          {BRAND.tagline}
        </p>
        <div className="gold-divider mx-auto my-6 w-40" />
        <p className="max-w-md text-sm leading-relaxed text-white/70">
          Fragrance · Makeup · Skincare · Pharmacy & Wellness
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/shop"
            className="rounded-full bg-accent px-8 py-3.5 text-sm font-bold tracking-wider text-[color:var(--h-text-inv)] transition-all hover:bg-accent-2"
          >
            Enter the store →
          </Link>
          <Link
            to="/shop?product_type=perfume"
            className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:border-white/60 hover:text-white"
          >
            Skip intro
          </Link>
        </div>
      </div>
    </section>
  );
}