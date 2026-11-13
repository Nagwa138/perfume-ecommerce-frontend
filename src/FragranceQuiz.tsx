/**
 * FragranceQuiz.tsx  —  /quiz/fragrance
 * 5-question quiz that scores fragrance families and fetches real products
 * matching the top result.  Results come from getProducts() with family and
 * product_type filters — equivalent to Eloquent scopes chained at query time.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { getProducts, type Product } from "./api";
import ProductCard from "./ProductCard";

type Answer = { scores: Partial<Record<string, number>> };

const QUESTIONS: Array<{
  q:    string;
  opts: Array<{ label: string; emoji: string; scores: Partial<Record<string, number>> }>;
}> = [
  {
    q: "Which season speaks to you most?",
    opts: [
      { label: "Spring",  emoji: "🌸", scores: { Floral: 2, "Fresh/Aquatic": 1 } },
      { label: "Summer",  emoji: "☀️", scores: { Citrus: 2, "Fresh/Aquatic": 1 } },
      { label: "Autumn",  emoji: "🍂", scores: { Woody: 2, "Oriental/Amber": 1 } },
      { label: "Winter",  emoji: "❄️", scores: { "Oriental/Amber": 2, Leather: 1, Musk: 1 } },
    ],
  },
  {
    q: "What describes your personal style?",
    opts: [
      { label: "Light & Effortless", emoji: "🌊", scores: { "Fresh/Aquatic": 2, Citrus: 1 } },
      { label: "Bold & Sensual",     emoji: "🔥", scores: { "Oriental/Amber": 2, Leather: 1 } },
      { label: "Romantic & Feminine",emoji: "🌹", scores: { Floral: 2, Musk: 1 } },
      { label: "Earthy & Grounded",  emoji: "🌿", scores: { Woody: 2, Aromatic: 1 } },
    ],
  },
  {
    q: "When do you wear fragrance most?",
    opts: [
      { label: "Every day",    emoji: "☕", scores: { "Fresh/Aquatic": 2, Citrus: 1 } },
      { label: "Date night",   emoji: "🌙", scores: { "Oriental/Amber": 2, Floral: 1 } },
      { label: "Office",       emoji: "💼", scores: { Aromatic: 2, "Fresh/Aquatic": 1 } },
      { label: "Special event",emoji: "✨", scores: { Floral: 1, "Oriental/Amber": 1, Leather: 1, Musk: 1 } },
    ],
  },
  {
    q: "How long do you want your fragrance to last?",
    opts: [
      { label: "2–3 hours",   emoji: "⏱️", scores: { Citrus: 2, "Fresh/Aquatic": 1 } },
      { label: "Half the day",emoji: "🌤️", scores: { Floral: 1, Aromatic: 1 } },
      { label: "All day",     emoji: "🌟", scores: { Woody: 1, Musk: 1 } },
      { label: "Days after",  emoji: "💎", scores: { "Oriental/Amber": 2, Leather: 2 } },
    ],
  },
  {
    q: "Close your eyes — your dream scent is closest to:",
    opts: [
      { label: "Fresh flowers after rain",    emoji: "💐", scores: { Floral: 2, "Fresh/Aquatic": 1 } },
      { label: "Warm vanilla and spices",     emoji: "🍯", scores: { "Oriental/Amber": 2, Gourmand: 2 } },
      { label: "Cedarwood and damp earth",    emoji: "🌲", scores: { Woody: 2, Aromatic: 1 } },
      { label: "Zesty citrus burst",          emoji: "🍋", scores: { Citrus: 2, "Fresh/Aquatic": 1 } },
    ],
  },
];

const FAMILY_DESCS: Record<string, string> = {
  Floral:          "Romantic and elegant — roses, jasmine and peony unfold on your skin.",
  "Fresh/Aquatic": "Light and invigorating — ocean air, green leaves and cool mist.",
  Citrus:          "Bright and sparkling — a burst of bergamot, lemon and grapefruit.",
  "Oriental/Amber":"Warm and seductive — amber resins, vanilla and exotic spices.",
  Woody:           "Grounded and sophisticated — sandalwood, cedarwood and oud.",
  Aromatic:        "Herbaceous and clean — lavender, rosemary and fresh herbs.",
  Leather:         "Bold and distinctive — rich leather, smoke and deep woods.",
  Gourmand:        "Sweet and indulgent — caramel, chocolate and warm pastry.",
  Musk:            "Soft and intimate — white musk, clean skin and powdery warmth.",
};

type Step = "quiz" | "loading" | "results";

export default function FragranceQuiz() {
  const [step,     setStep]     = useState<Step>("quiz");
  const [qIdx,     setQIdx]     = useState(0);
  const [answers,  setAnswers]  = useState<Answer[]>([]);
  const [family,   setFamily]   = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const choose = async (opt: Answer["scores"]) => {
    const next = [...answers, { scores: opt }];
    setAnswers(next);

    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
      return;
    }

    // Tally scores
    setStep("loading");
    const tally: Record<string, number> = {};
    for (const a of next) {
      for (const [fam, pts] of Object.entries(a.scores)) {
        tally[fam] = (tally[fam] ?? 0) + (pts ?? 0);
      }
    }
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    const topFamily = sorted.length > 0 ? sorted[0][0] : "Floral";
    setFamily(topFamily);
    const data = await getProducts({ product_type: "perfume", family: topFamily, sort: "popular", page_size: 3 });
    setProducts(data.items);
    setStep("results");
  };

  const restart = () => {
    setStep("quiz"); setQIdx(0); setAnswers([]); setFamily(""); setProducts([]);
  };

  const q = QUESTIONS[qIdx];
  const progress = ((qIdx) / QUESTIONS.length) * 100;

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-28">
      {/* Back link */}
      <Link to="/quiz" className="mb-8 inline-flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors">
        <ArrowLeft size={12} /> All quizzes
      </Link>

      <AnimatePresence mode="wait">

        {/* ── Quiz ─────────────────────────────────────────────────────────── */}
        {step === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            {/* Progress */}
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>Question {qIdx + 1} of {QUESTIONS.length}</span>
                <span>Find Your Fragrance</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <h2 className="mb-8 font-display text-3xl font-bold leading-tight md:text-4xl">
              {q.q}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {q.opts.map((opt) => (
                <motion.button
                  key={opt.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => choose(opt.scores)}
                  className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-surface-2 p-5 text-left transition-all hover:border-accent/40"
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="font-semibold leading-snug group-hover:text-accent transition-colors">
                    {opt.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Loading ───────────────────────────────────────────────────────── */}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-muted">Finding your perfect scent…</p>
          </motion.div>
        )}

        {/* ── Results ───────────────────────────────────────────────────────── */}
        {step === "results" && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-10 rounded-2xl border border-accent/30 bg-accent/8 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">Your Match</p>
              <h2 className="mt-2 font-display text-4xl font-bold">{family}</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
                {FAMILY_DESCS[family] ?? "A beautifully curated fragrance family."}
              </p>
            </div>

            {products.length > 0 ? (
              <>
                <h3 className="mb-5 font-display text-xl font-bold">We Recommend</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted">No products loaded yet — run the seed script first.</p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to={`/shop?product_type=perfume&family=${encodeURIComponent(family)}`}
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-2 transition-colors">
                Shop All {family} <ArrowRight size={13} />
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
