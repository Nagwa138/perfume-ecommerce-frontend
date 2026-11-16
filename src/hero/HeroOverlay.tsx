// src/hero/HeroOverlay.tsx
// Corner brand + centered beat captions + progress + skip/enter.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND } from "../brand";
import { BEATS } from "./types";
import { useBeat, scrollRef } from "./useStreetStore";

export default function HeroOverlay({ reducedMotion }: { reducedMotion: boolean }) {
  const activeBeat = useBeat();
  const [p, setP] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const loop = () => { setP(scrollRef.current); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const showFinal = p > 0.9;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">

      {/* Top row: corner brand + progress */}
      <div className="flex items-start justify-between px-5 pt-6 md:px-10 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="font-display text-3xl font-black tracking-tighter text-white sm:text-4xl md:text-5xl">
            {BRAND.nameUpper}
          </h1>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
            {BRAND.tagline}
          </p>
        </motion.div>

        <div className="hidden h-24 w-px overflow-hidden rounded-full bg-white/20 md:block">
          <div className="w-full rounded-full bg-white/80" style={{ height: `${p * 100}%`, transition: "height 60ms linear" }} />
        </div>
      </div>

      {/* Center: beat captions / final */}
      <div className="flex flex-1 items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {activeBeat >= 0 && activeBeat < BEATS.length && !showFinal && (
            <motion.div
              key={BEATS[activeBeat].id}
              className="text-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <p className="font-display text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)] sm:text-7xl md:text-8xl">
                {BEATS[activeBeat].title}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/75 md:text-base">
                {BEATS[activeBeat].sub}
              </p>
              <motion.div className="pointer-events-auto mx-auto mt-5 inline-block"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Link to={BEATS[activeBeat].shopQuery}
                  className="rounded-full bg-white/95 px-6 py-2.5 text-sm font-bold text-black backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg">
                  {BEATS[activeBeat].ctaLabel} →
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFinal && (
            <motion.div key="final" className="text-center"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="font-display text-5xl font-black tracking-tighter text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)] sm:text-7xl md:text-8xl">
                {BRAND.nameUpper}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/75 md:text-base">
                The doors are open. Step inside.
              </p>
              <motion.div className="pointer-events-auto mx-auto mt-6 inline-block"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
                <a href="#first-section"
                  className="rounded-full bg-accent px-8 py-3 text-sm font-bold tracking-wider text-[color:var(--h-text-inv)] transition-all hover:bg-accent-2">
                  Enter the store →
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: scroll hint + skip intro */}
      <div className="flex items-end justify-between px-5 pb-6 md:px-10 md:pb-8">
        <div className="w-24" />
        <AnimatePresence>
          {p < 0.05 && !reducedMotion && (
            <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">Scroll to walk</p>
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}>
                <svg width="14" height="20" viewBox="0 0 16 24" fill="none" className="text-white/60">
                  <rect x="6" y="2" width="4" height="8" rx="2" fill="currentColor" opacity="0.5" />
                  <path d="M8 14l-4 4h8l-4-4z" fill="currentColor" opacity="0.5" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <a href="#first-section"
          className="pointer-events-auto rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70 backdrop-blur-sm transition-all hover:border-white/60 hover:text-white">
          Skip intro
        </a>
      </div>
    </div>
  );
}