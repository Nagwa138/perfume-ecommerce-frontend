import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Product } from "../../api";
import { fmtEGP } from "../../api";
import type { RitualAnswers } from "./questions";
import { getJustification } from "./justifications";

type Props = {
  products: Product[];
  answers: RitualAnswers;
  onReset: () => void;
  reducedMotion: boolean;
};

function ritualToken(answers: RitualAnswers): string {
  try { return btoa(JSON.stringify(answers)); } catch { return ""; }
}

export default function ResultStrip({ products, answers, onReset, reducedMotion }: Props) {
  const token = ritualToken(answers);
  const justification = getJustification(answers);

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">
        YOUR RITUAL
      </p>
      <h3 className="font-display text-2xl md:text-3xl text-[var(--color-ink)] mb-3">
        A ritual, composed for you.
      </h3>
      <p className="text-sm text-[var(--color-ink-muted)] mb-8 max-w-md italic">
        {justification}
      </p>

      {/* Product strip */}
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {products.map((p, i) => {
          const price = p.sale_price ?? (p.sizes?.[0]?.price ?? 0);
          const img = p.images?.[0] ?? "";
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.35 }}
              className="w-[160px] md:w-[200px] shrink-0 group"
            >
              <Link to={`/product/${p.slug}`} className="block">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-[var(--color-surface)] mb-3">
                  {img ? (
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-[var(--color-ink-muted)]">No image</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] mb-0.5">
                  {p.brand}
                </p>
                <p className="text-sm font-medium text-[var(--color-ink)] line-clamp-2 leading-snug mb-1">
                  {p.name}
                </p>
                <p className="text-sm font-bold text-[var(--color-accent)]">
                  {price > 0 ? fmtEGP(price) : "—"}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* CTAs */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          to={`/shop${token ? `?ritual=${token}` : ""}`}
          className="rounded-full bg-[var(--color-accent)] px-8 py-3 text-sm font-bold text-[var(--color-accent-contrast)] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          View your ritual →
        </Link>
        <button
          onClick={onReset}
          className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          Start a new ritual
        </button>
      </div>
    </motion.div>
  );
}
