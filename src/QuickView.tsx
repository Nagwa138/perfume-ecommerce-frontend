import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import type { Product } from "./api";
import { useCart } from "./store";

type Props = {
  product: Product | null;
  onClose: () => void;
};

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];

export default function QuickView({ product: p, onClose }: Props) {
  const [size, setSize]  = useState<string | null>(null);
  const [qty,  setQty]   = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const add = useCart((s) => s.add);

  // Reset local state each time the product changes
  useEffect(() => {
    setSize(null);
    setQty(1);
    setImgIdx(0);
  }, [p?.id]);

  // Esc key + focus trap
  useEffect(() => {
    if (!p) return;

    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const el = dialogRef.current;
      if (!el) return;
      const focusable = el.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener("keydown", trap);
    // Lock body scroll
    document.body.style.overflow = "hidden";
    // Auto-focus first button after animation frame
    requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("button:not([disabled])")?.focus();
    });

    return () => {
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = "";
    };
  }, [p, onClose]);

  const sizes = p?.sizes?.length ? p.sizes : DEFAULT_SIZES;
  const images = p ? (p.images?.length ? p.images : [p.image]) : [];
  const displayPrice = p ? (p.sale_price ?? p.price) : 0;

  const handleAdd = () => {
    if (p) { for (let i = 0; i < qty; i++) add(p); onClose(); }
  };

  return createPortal(
    <AnimatePresence>
      {p && (
        // Wrapper — fades in, centres the dialog
        <motion.div
          key="qv-overlay"
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${p.name}`}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-t-2xl bg-surface md:rounded-2xl"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320, delay: 0.06 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row">

              {/* ── Image panel ── */}
              <div className="relative shrink-0 md:w-56 lg:w-64">
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={images[imgIdx] ?? p.image}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === imgIdx ? "w-4 bg-white" : "w-1.5 bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Info panel ── */}
              <div className="flex flex-col gap-4 p-5 md:flex-1 md:overflow-y-auto md:max-h-[80vh]">

                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                      {p.category}
                    </p>
                    <h3 className="mt-0.5 text-lg font-bold leading-tight">{p.name}</h3>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className={`text-xl font-bold ${p.sale_price ? "text-sale" : ""}`}>
                        ${displayPrice.toFixed(2)}
                      </span>
                      {p.sale_price && (
                        <span className="text-sm text-muted line-through">
                          ${p.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close quick view"
                    className="mt-0.5 shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Description */}
                {p.description && (
                  <p className="text-sm leading-relaxed text-muted line-clamp-3">
                    {p.description}
                  </p>
                )}

                {/* Size chips */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                    Size
                    {size && <span className="ml-1.5 text-white">— {size}</span>}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
                          size === s
                            ? "border-accent bg-accent/15 text-accent"
                            : "border-border text-muted hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Qty stepper + Add to cart */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-white"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 select-none text-center text-sm font-semibold">
                      {qty}
                    </span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => setQty((q) => Math.min(Math.max(p.stock, 1), q + 1))}
                      className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={p.stock < 1}
                    className="flex-1 rounded-full bg-accent py-2.5 text-sm font-bold tracking-wider text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {p.stock < 1 ? "Sold Out" : "Add to Cart"}
                  </button>
                </div>

                {/* Stock note */}
                {p.stock > 0 && p.stock <= 10 && (
                  <p className="text-xs text-orange-400">
                    Only {p.stock} left in stock
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
