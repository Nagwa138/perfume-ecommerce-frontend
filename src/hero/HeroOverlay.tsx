import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  useOutfitStore,
  TOP_OPTIONS, BOTTOM_OPTIONS, OUTER_OPTIONS, SHOE_OPTIONS, ACCESSORY_OPTIONS,
  type ClothingSlot, type ClothingItem,
} from "./useOutfitStore";

const CAPTIONS = ["Streetwear", "Denim", "Sneakers", "Outerwear"] as const;

type SlotGroup = {
  slot: ClothingSlot;
  label: string;
  options: (ClothingItem | null)[];
};

const SLOT_GROUPS: SlotGroup[] = [
  { slot: "top",       label: "Top",    options: TOP_OPTIONS },
  { slot: "bottom",    label: "Bottom", options: BOTTOM_OPTIONS },
  { slot: "outerwear", label: "Outer",  options: OUTER_OPTIONS },
  { slot: "shoes",     label: "Shoes",  options: SHOE_OPTIONS },
  { slot: "accessory", label: "Acc",    options: ACCESSORY_OPTIONS },
];

type Props = {
  activeBeat: number;   // -1 = none, 0–3 = beat index
  scrollPct:  number;   // 0–1
};

export default function HeroOverlay({ activeBeat, scrollPct }: Props) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { top, bottom, outerwear, shoes, accessory, setSlot } = useOutfitStore();
  const current: Record<ClothingSlot, ClothingItem | null> = { top, bottom, outerwear, shoes, accessory };

  const shopUrl = `/?cat=${encodeURIComponent(top.category)}`;

  return (
    /* pointer-events-none so scroll events pass through to window */
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">

      {/* ── Brand name ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-4 pt-5 md:px-10 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="font-display text-3xl font-black tracking-tighter text-white sm:text-4xl md:text-5xl">
            NOVA WEAR
          </h1>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-white/50">
            Fall Collection — Live Now
          </p>
        </motion.div>

        {/* Scroll progress bar — vertical on desktop, top line on mobile */}
        <div className="hidden h-28 w-px overflow-hidden rounded-full bg-white/15 md:block">
          <motion.div
            className="w-full origin-top rounded-full bg-white/70"
            style={{ scaleY: scrollPct, transformOrigin: "top" }}
          />
        </div>
      </div>

      {/* Mobile progress bar — horizontal */}
      <div className="mx-4 mt-2 h-px overflow-hidden rounded-full bg-white/15 md:hidden">
        <motion.div
          className="h-full origin-left rounded-full bg-white/70"
          style={{ scaleX: scrollPct, transformOrigin: "left" }}
        />
      </div>

      {/* ── Beat caption (centred mid-screen) ─────────────────────── */}
      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {activeBeat >= 0 && (
            <motion.div
              key={activeBeat}
              className="text-center"
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.92,  y: -16 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
            >
              <p className="font-display text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)] sm:text-7xl md:text-8xl">
                {CAPTIONS[activeBeat]}
              </p>
              <motion.div
                className="pointer-events-auto mx-auto mt-4 inline-block"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  to={shopUrl}
                  className="rounded-full bg-white/90 px-5 py-2 text-sm font-bold text-black backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg"
                >
                  Shop {CAPTIONS[activeBeat]} →
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom bar: scroll hint / outfit switcher ─────────────── */}
      <div className="flex flex-col items-center gap-3 pb-5 md:pb-8">

        {/* Scroll hint (fades as user scrolls) */}
        <AnimatePresence>
          {scrollPct < 0.06 && (
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-1"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                Scroll to walk
              </p>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              >
                <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="text-white/40">
                  <rect x="6" y="2" width="4" height="8" rx="2" fill="currentColor" opacity="0.5" />
                  <path d="M8 14l-4 4h8l-4-4z" fill="currentColor" opacity="0.5" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outfit switcher toggle */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setSwitcherOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm transition-all hover:border-white/50 hover:text-white"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: top.color }} />
            Outfit
            <svg
              width="10" height="10" viewBox="0 0 10 10"
              className={`transition-transform ${switcherOpen ? "rotate-180" : ""}`}
            >
              <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </button>

          <AnimatePresence>
            {switcherOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: 8,   scale: 0.97 }}
                transition={{ duration: 0.22 }}
                className="mt-2 w-[min(92vw,460px)] overflow-hidden rounded-2xl border border-white/15 bg-black/80 p-4 backdrop-blur-md"
              >
                {/* Slot rows */}
                {SLOT_GROUPS.map(({ slot, label, options }) => (
                  <div key={slot} className="mb-3 last:mb-0">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {options.map((item, idx) => {
                        const active = item === null
                          ? current[slot] === null
                          : current[slot]?.label === item.label;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSlot(slot, item)}
                            title={item?.label ?? "None"}
                            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                              active
                                ? "border-white/70 bg-white/15 text-white"
                                : "border-white/15 text-white/50 hover:border-white/40 hover:text-white/80"
                            }`}
                          >
                            {item ? (
                              <>
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full border border-white/20"
                                  style={{ background: item.color }}
                                />
                                {item.label}
                              </>
                            ) : (
                              "None"
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Shop this look */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <p className="text-[11px] text-white/40">
                    {[top.label, outerwear?.label, shoes.label].filter(Boolean).join(" · ")}
                  </p>
                  <Link
                    to={shopUrl}
                    className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent-2"
                    onClick={() => setSwitcherOpen(false)}
                  >
                    Shop this look →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Beat dot indicators */}
        <div className="flex gap-2">
          {CAPTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeBeat === i ? "w-5 bg-white" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
