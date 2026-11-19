/**
 * SkincareQuiz.tsx  —  /quiz/skincare
 * 4-question quiz that maps skin type + concern to skincare subcategories,
 * then fetches real products for a morning and evening routine.
 * Equivalent to a Laravel form-request that validates intent then queries
 * scoped Eloquent models — the quiz answers are the "request input".
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw, Sun, Moon } from "lucide-react";
import { getProducts, type Product } from "./api";
import ProductCard from "./ProductCard";

type SkinType   = "dry" | "oily" | "combination" | "sensitive" | "normal";
type SkinConcern = "hydration" | "anti-aging" | "brightening" | "acne" | "sensitivity";
type Routine    = "minimal" | "moderate" | "full";

interface Answers {
  skinType:   SkinType | "";
  concern:    SkinConcern | "";
  routine:    Routine | "";
  timing:     "morning" | "evening" | "both" | "";
}

const QUESTIONS: Array<{
  key:  keyof Answers;
  q:    string;
  opts: Array<{ label: string; emoji: string; value: string }>;
}> = [
  {
    key: "skinType",
    q: "What is your skin type?",
    opts: [
      { label: "Dry",          emoji: "🌵", value: "dry" },
      { label: "Oily",         emoji: "✨", value: "oily" },
      { label: "Combination",  emoji: "⚖️",  value: "combination" },
      { label: "Sensitive",    emoji: "🌸", value: "sensitive" },
      { label: "Normal",       emoji: "😊", value: "normal" },
    ],
  },
  {
    key: "concern",
    q: "What is your main skin concern?",
    opts: [
      { label: "Hydration & Plumping", emoji: "💧", value: "hydration" },
      { label: "Anti-aging & Firming", emoji: "⏳", value: "anti-aging" },
      { label: "Brightening & Glow",   emoji: "🌟", value: "brightening" },
      { label: "Acne & Pores",         emoji: "🫧", value: "acne" },
      { label: "Redness & Sensitivity",emoji: "🌿", value: "sensitivity" },
    ],
  },
  {
    key: "routine",
    q: "How many steps do you want in your routine?",
    opts: [
      { label: "1–2 products",        emoji: "🏃", value: "minimal" },
      { label: "3–4 steps",           emoji: "🚶", value: "moderate" },
      { label: "Full multi-step ritual",emoji: "🧘", value: "full" },
    ],
  },
  {
    key: "timing",
    q: "When do you use skincare?",
    opts: [
      { label: "Morning only", emoji: "☀️", value: "morning" },
      { label: "Evening only", emoji: "🌙", value: "evening" },
      { label: "Both",         emoji: "🔄", value: "both" },
    ],
  },
];

// Maps (concern, skinType) → primary subcategory
function pickSerum(concern: string): string {
  const MAP: Record<string, string> = {
    hydration:   "Serum",
    "anti-aging":"Serum",
    brightening: "Vitamin C Serum",
    acne:        "Retinol",
    sensitivity: "Serum",
  };
  return MAP[concern] ?? "Serum";
}

function pickMoisturizer(skinType: string): string {
  if (skinType === "oily" || skinType === "acne-prone") return "Moisturizer";
  if (skinType === "dry")  return "Moisturizer";
  return "Moisturizer";
}

type Step = "quiz" | "loading" | "results";

interface RoutineProducts {
  morning: Product[];
  evening: Product[];
}

export default function SkincareQuiz() {
  const [step,    setStep]    = useState<Step>("quiz");
  const [qIdx,    setQIdx]    = useState(0);
  const [answers, setAnswers] = useState<Answers>({ skinType: "", concern: "", routine: "", timing: "" });
  const [result,  setResult]  = useState<RoutineProducts>({ morning: [], evening: [] });
  const choose = async (key: keyof Answers, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);

    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
      return;
    }

    setStep("loading");

    const serumSub = pickSerum(next.concern);
    const moiSub   = pickMoisturizer(next.skinType);

    const [serums, moisturizers, cleansers] = await Promise.all([
      getProducts({ product_type: "skincare", subcategory: serumSub,  sort: "popular", page_size: 2 }),
      getProducts({ product_type: "skincare", subcategory: moiSub,    sort: "popular", page_size: 2 }),
      getProducts({ product_type: "skincare", subcategory: "Cleanser", sort: "popular", page_size: 1 }),
    ]);

    const timing = next.timing;
    const morningBase  = [...cleansers.items, ...moisturizers.items].slice(0, 2);
    const eveningBase  = [...serums.items,    ...moisturizers.items].slice(0, 2);

    setResult({
      morning: timing === "evening" ? [] : morningBase,
      evening: timing === "morning" ? [] : eveningBase,
    });
    setStep("results");
  };

  const restart = () => {
    setStep("quiz"); setQIdx(0);
    setAnswers({ skinType: "", concern: "", routine: "", timing: "" });
    setResult({ morning: [], evening: [] });
  };

  const q = QUESTIONS[qIdx];
  const progress = (qIdx / QUESTIONS.length) * 100;

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-28">
      <Link to="/quiz" className="mb-8 inline-flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors">
        <ArrowLeft size={12} /> All quizzes
      </Link>

      <AnimatePresence mode="wait">

        {/* ── Quiz ─────────────────────────────────────────────────────────── */}
        {step === "quiz" && (
          <motion.div key={`q-${qIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>Question {qIdx + 1} of {QUESTIONS.length}</span>
                <span>Build Your Skincare Routine</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
                <motion.div className="h-full rounded-full" style={{ background: "var(--color-accent)" }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>

            <h2 className="mb-8 font-display text-3xl font-bold leading-tight md:text-4xl">{q.q}</h2>

            <div className={`grid gap-3 ${q.opts.length <= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
              {q.opts.map((opt) => (
                <motion.button key={opt.value}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => choose(q.key, opt.value)}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-5 py-4 text-left transition-all hover:border-[var(--color-accent)]/50">
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="font-semibold group-hover:text-[var(--color-accent)] transition-colors">{opt.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Loading ───────────────────────────────────────────────────────── */}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center py-32 text-center">
            <div className="mb-6 h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
            <p className="text-muted">Building your personalised routine…</p>
          </motion.div>
        )}

        {/* ── Results ───────────────────────────────────────────────────────── */}
        {step === "results" && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-10 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">Your Routine</p>
              <h2 className="mt-2 font-display text-3xl font-bold">
                {answers.skinType.charAt(0).toUpperCase() + answers.skinType.slice(1)} Skin · {" "}
                {answers.concern.replace(/-/g, " ")}
              </h2>
              <p className="mt-2 text-sm text-muted">
                A curated selection based on your skin type and goals.
              </p>
            </div>

            {result.morning.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                  <Sun size={16} className="text-amber-400" /> Morning Routine
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {result.morning.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {result.evening.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                  <Moon size={16} className="text-blue-400" /> Evening Routine
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {result.evening.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {result.morning.length === 0 && result.evening.length === 0 && (
              <p className="text-center text-muted">No products loaded yet — run the seed script first.</p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop?product_type=skincare"
                className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold text-[var(--color-accent-contrast)] transition-colors hover:bg-[var(--color-accent-hover)]">
                Shop All Skincare <ArrowRight size={13} />
              </Link>
              <button onClick={restart}
                className="flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-muted hover:border-white/40 hover:text-white transition-colors">
                <RefreshCw size={13} /> Retake
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
