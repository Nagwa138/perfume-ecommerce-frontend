import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RitualQuestion } from "./questions";

type Props = {
  question: RitualQuestion;
  index: number;
  total: number;
  selected: string | null;
  onSelect: (value: string) => void;
  onBack: () => void;
  reducedMotion: boolean;
};

const slideVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0  },
  exit:   { opacity: 0, x: -40 },
};

const fadeVariants = {
  enter:  { opacity: 0 },
  center: { opacity: 1 },
  exit:   { opacity: 0 },
};

export default function QuestionCard({
  question, index, total, selected, onSelect, onBack, reducedMotion,
}: Props) {
  const variants = reducedMotion ? fadeVariants : slideVariants;

  // keyboard: 1-N selects option, Enter advances, ← goes back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "Backspace") { onBack(); return; }
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= question.options.length) {
        onSelect(question.options[num - 1].value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [question, onSelect, onBack]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="w-full"
      >
        {/* Progress segments */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor:
                  i < index
                    ? "var(--color-accent)"
                    : i === index
                    ? "var(--color-ink-soft)"
                    : "var(--color-line)",
              }}
            />
          ))}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)] mb-4">
          {question.eyebrow}
        </p>
        <h3 className="font-display text-2xl md:text-3xl text-[var(--color-ink)] mb-8">
          {question.prompt}
        </h3>

        <div className="flex flex-wrap gap-3">
          {question.options.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={[
                "rounded-full border px-6 py-3 text-sm font-medium transition-all duration-150",
                selected === opt.value
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-contrast)]"
                  : "border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
              ].join(" ")}
            >
              <span className="text-[var(--color-ink-muted)] mr-2 text-xs">{i + 1}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {index > 0 && (
          <button
            onClick={onBack}
            className="mt-8 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            ← Back
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
