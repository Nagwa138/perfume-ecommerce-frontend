import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import { fmtEGP, type Product } from "./api";
import { useCart } from "./store";

type Props = { product: Product | null; onClose: () => void };

function minPrice(p: Product): number {
  if (p.sale_price != null) return p.sale_price;
  const prices = (p.sizes ?? []).map((s) => s.price).filter(Boolean);
  return prices.length ? Math.min(...prices) : 0;
}

function totalStock(p: Product): number {
  if ((p.variants ?? []).length > 0) return (p.variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
  return (p.sizes ?? []).reduce((s, sz) => s + (sz.stock ?? 0), 0);
}

export default function QuickView({ product: p, onClose }: Props) {
  const [selSize, setSelSize] = useState<number | null>(null);
  const [qty,     setQty]     = useState(1);
  const [imgIdx,  setImgIdx]  = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const add = useCart((s) => s.add);

  useEffect(() => { setSelSize(null); setQty(1); setImgIdx(0); }, [p?.id]);

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
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };
    document.addEventListener("keydown", trap);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("button:not([disabled])")?.focus());
    return () => { document.removeEventListener("keydown", trap); document.body.style.overflow = ""; };
  }, [p, onClose]);

  if (!p) return null;

  const images   = (p.images ?? []).filter(Boolean) as string[];
  const sizes    = p.sizes ?? [];
  const stock    = totalStock(p);
  const display  = minPrice(p);
  const chosenSize = selSize ?? (sizes.find((s) => s.stock > 0)?.ml ?? sizes[0]?.ml ?? 0);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) add(p, chosenSize);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {p && (
        <motion.div
          key="qv-overlay"
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          <motion.div
            ref={dialogRef}
            role="dialog" aria-modal="true" aria-label={`Quick view: ${p.name}`}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-t-2xl bg-surface md:rounded-2xl"
            initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 48, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320, delay: 0.06 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative shrink-0 md:w-56 lg:w-64">
                <div className="aspect-[4/5] w-full overflow-hidden">
                  {images[imgIdx] ? (
                    <img src={images[imgIdx]} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-2">
                      <span className="font-display text-4xl font-bold tracking-widest text-white/10">AURA</span>
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-4 p-5 md:flex-1 md:max-h-[80vh] md:overflow-y-auto">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{p.brand}</p>
                    <h3 className="mt-0.5 text-lg font-bold leading-tight">{p.name}</h3>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className={`text-xl font-bold ${p.sale_price ? "text-sale" : ""}`}>
                        {fmtEGP(display)}
                      </span>
                    </div>
                  </div>
                  <button onClick={onClose} aria-label="Close quick view"
                    className="mt-0.5 shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                {p.description && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted">{p.description}</p>
                )}

                {/* Size selector */}
                {sizes.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                      Size {chosenSize > 0 && <span className="text-white">— {chosenSize} ml</span>}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sizes.map((sz) => (
                        <button key={sz.ml} disabled={sz.stock === 0}
                          onClick={() => setSelSize(selSize === sz.ml ? null : sz.ml)}
                          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-30 ${
                            chosenSize === sz.ml
                              ? "border-accent bg-accent/15 text-accent"
                              : "border-border text-muted hover:border-white/40 hover:text-white"
                          }`}
                        >
                          {sz.ml} ml
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qty + Add */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-border">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"
                      className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-white">
                      <Minus size={14} />
                    </button>
                    <span className="w-7 select-none text-center text-sm font-semibold">{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(Math.max(stock, 1), q + 1))} aria-label="Increase quantity"
                      className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-white">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={handleAdd}
                    disabled={stock < 1}
                    className="flex-1 rounded-full bg-accent py-2.5 text-sm font-bold tracking-wider text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {stock < 1 ? "Sold Out" : "Add to Cart"}
                  </button>
                </div>

                {stock > 0 && stock <= 5 && (
                  <p className="text-xs text-orange-400">Only {stock} left</p>
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
