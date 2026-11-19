// src/hero/StaticStreetHero.tsx
// "Alabaster & gold" — a cinematic editorial hero.
// Dark warm dusk palette, Egyptian soul (Arabic subhead, four Cairo ateliers),
// no three.js, no heavy assets. Pure CSS/SVG + framer-motion.
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { BRAND } from "../brand";

const BRANCHES = ["Zamalek", "Heliopolis", "New Cairo", "Alexandria"] as const;
const CATEGORIES = ["Fragrance", "Makeup", "Skincare", "Pharmacy"] as const;

/* ────────────────────────────────────────────────────────────────── */
/*  Decorative pieces                                                  */
/* ────────────────────────────────────────────────────────────────── */

function MashrabiyaRail({ side }: { side: "left" | "right" }) {
  return (
    <svg
      className={`pointer-events-none absolute top-0 h-full w-14 md:w-20 opacity-[0.14] text-[#D9B979] ${
        side === "left" ? "left-0" : "right-0"
      }`}
      viewBox="0 0 40 400"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <pattern
          id={`mash-${side}`}
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M20 2 L38 20 L20 38 L2 20 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
          />
          <path
            d="M20 10 L30 20 L20 30 L10 20 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.4"
          />
          <circle cx="20" cy="20" r="1.5" fill="currentColor" opacity="0.7" />
        </pattern>
      </defs>
      <rect width="40" height="400" fill={`url(#mash-${side})`} />
    </svg>
  );
}

function CornerFiligree({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
}) {
  const rotate =
    position === "tl" ? 0 : position === "tr" ? 90 : position === "br" ? 180 : 270;
  const pos = {
    tl: "top-6 left-6 md:top-10 md:left-10",
    tr: "top-6 right-6 md:top-10 md:right-10",
    bl: "bottom-28 left-6 md:bottom-24 md:left-10",
    br: "bottom-28 right-6 md:bottom-24 md:right-10",
  }[position];

  return (
    <svg
      className={`pointer-events-none absolute ${pos} h-10 w-10 md:h-14 md:w-14 text-[#D9B979]/50`}
      viewBox="0 0 60 60"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <path
        d="M2 2 L28 2 M2 2 L2 28 M8 2 Q8 8 2 8 M2 14 Q8 14 8 20 Q14 20 14 14"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
      />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function GoldDust({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  const count = 24;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 41) % 100;
        const top = (i * 71) % 100;
        const size = 1 + (i % 3) * 0.6;
        const dur = 6 + (i % 5) * 1.5;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#D9B979]"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              boxShadow: "0 0 6px #D9B979",
            }}
            animate={{
              y: [0, -40 - (i % 5) * 8, 0],
              opacity: [0.15, 0.7, 0.15],
            }}
            transition={{
              duration: dur,
              repeat: Infinity,
              delay: (i * 0.4) % 5,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Main                                                               */
/* ────────────────────────────────────────────────────────────────── */

export default function StaticStreetHero() {
  const reduced = useReducedMotion() ?? false;
  const [cursor, setCursor] = useState({ x: 50, y: 42 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      setCursor({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  return (
    <section
      className="relative isolate flex min-h-screen w-full flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 35%, #4a2c1a 0%, #2a1810 35%, #140a06 70%, #080502 100%)",
      }}
    >
      {/* Spotlight that follows the cursor */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle 520px at ${cursor.x}% ${cursor.y}%, rgba(217,185,121,0.22) 0%, transparent 65%)`,
          mixBlendMode: "screen",
          transition: reduced ? undefined : "background 0.2s ease-out",
        }}
        aria-hidden
      />

      {/* Film grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' stitchTiles='stitch'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>\")",
        }}
        aria-hidden
      />

      {/* Mashrabiya side rails */}
      <MashrabiyaRail side="left" />
      <MashrabiyaRail side="right" />

      {/* Corner filigree */}
      <CornerFiligree position="tl" />
      <CornerFiligree position="tr" />
      <CornerFiligree position="bl" />
      <CornerFiligree position="br" />

      {/* Gold dust particles */}
      <GoldDust reduced={reduced} />

      {/* ── Top frame ────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-start justify-between px-6 pt-8 md:px-14 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3"
        >
          <span className="h-px w-8 bg-[#D9B979]/70" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#D9B979]/85">
            Est. 2026 · Cairo
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70">
            Four ateliers
          </p>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D9B979] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D9B979]" />
          </span>
        </motion.div>
      </div>

      {/* ── Centrepiece ──────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        {/* Ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.25 }}
          className="mb-8 flex items-center gap-3"
          aria-hidden
        >
          <span className="h-px w-16 md:w-28 bg-gradient-to-r from-transparent to-[#D9B979]/80" />
          <svg width="22" height="22" viewBox="0 0 24 24" className="text-[#D9B979]">
            <path
              d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
              fill="currentColor"
              opacity="0.85"
            />
          </svg>
          <span className="h-px w-16 md:w-28 bg-gradient-to-l from-transparent to-[#D9B979]/80" />
        </motion.div>

        {/* Arabic eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="font-arabic text-base md:text-lg text-[#D9B979]/90 mb-6"
          dir="rtl"
          style={{ fontFamily: '"Cairo", sans-serif' }}
        >
          متجر مصري للعطور ومستحضرات التجميل
        </motion.p>

        {/* Arabic wordmark — حُسَام (with tashkeel), centerpiece */}
        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          dir="rtl"
          lang="ar"
          className="font-arabic text-center bg-clip-text text-transparent select-none"
          style={{
            fontFamily: '"Cairo", sans-serif',
            fontWeight: 700,
            fontSize: "clamp(5rem, 18vw, 15rem)",
            lineHeight: 0.95,
            letterSpacing: "0.02em",
            backgroundImage:
              "linear-gradient(180deg, #F8F2E4 0%, #EAD9B4 40%, #D9B979 72%, #8B6A2C 100%)",
          }}
        >
          حُسَام
        </motion.h1>

        {/* Shimmer rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 1.25, ease: "easeOut" }}
          className="mt-6 h-px w-60 md:w-[28rem] origin-center bg-gradient-to-r from-transparent via-[#D9B979] to-transparent"
        />

        {/* Tagline (EN) */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.35 }}
          className="font-display italic text-xl md:text-3xl text-white/90 mt-6"
        >
          {BRAND.tagline}
        </motion.p>

        {/* Tagline (AR) */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.45 }}
          className="font-arabic text-sm md:text-base text-white/55 mt-2"
          dir="rtl"
        >
          {BRAND.taglineAr}
        </motion.p>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.65 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[11px] uppercase tracking-[0.35em] text-white/55"
        >
          {CATEGORIES.map((c, i) => (
            <span key={c} className="flex items-center gap-5">
              <span>{c}</span>
              {i < CATEGORIES.length - 1 && (
                <span className="h-1 w-1 rounded-full bg-[#D9B979]/70" />
              )}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.85 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/shop"
            className="group relative overflow-hidden rounded-full px-10 py-4 text-sm font-bold uppercase tracking-[0.25em] text-[#1a1008] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_48px_rgba(217,185,121,0.5)]"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #EAD9B4 0%, #D9B979 50%, #B98E3C 100%)",
            }}
          >
            <span className="relative z-10">Enter the store</span>
            <span className="relative z-10 ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <a
            href="#first-section"
            className="rounded-full border border-white/25 px-8 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/80 transition-all hover:border-[#D9B979]/70 hover:text-white"
          >
            Discover the ritual
          </a>
        </motion.div>
      </div>

      {/* ── Bottom ribbon: the four ateliers ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.1 }}
        className="relative z-20 border-t border-[#D9B979]/15 bg-black/35 backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-5 md:flex-row md:justify-between md:gap-0 md:px-14">
          <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#D9B979]/80">
            Our ateliers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.3em] text-white/70">
            {BRANCHES.map((b, i) => (
              <span key={b} className="flex items-center gap-6">
                <span className="hover:text-white transition-colors">{b}</span>
                {i < BRANCHES.length - 1 && (
                  <span className="h-1 w-1 rounded-full bg-[#D9B979]/50" />
                )}
              </span>
            ))}
          </div>
          <motion.div
            animate={reduced ? undefined : { y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-white/55 md:flex"
          >
            <span>Scroll</span>
            <svg
              width="18"
              height="12"
              viewBox="0 0 18 12"
              className="text-[#D9B979]"
            >
              <path
                d="M2 6 H14 M10 2 L14 6 L10 10"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
