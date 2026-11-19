import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "../../api";
import type { Product } from "../../api";
import { RITUAL_QUESTIONS } from "./questions";
import type { RitualAnswers } from "./questions";
import { selectRitual } from "./scoring";
import { saveRitual, loadRitual, clearRitual } from "./storage";
import QuestionCard from "./QuestionCard";
import ResultStrip from "./ResultStrip";

type Phase = "returning" | "questions" | "completing" | "result";

const ADVANCE_DELAY_MS = 180;

export default function RitualFinder() {
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;

  const [phase,       setPhase]       = useState<Phase>("questions");
  const [step,        setStep]        = useState(0);
  const [answers,     setAnswers]     = useState<Partial<RitualAnswers>>({});
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [result,      setResult]      = useState<Product[]>([]);
  const [prevAnswers, setPrevAnswers] = useState<RitualAnswers | null>(null);
  const [prevResult,  setPrevResult]  = useState<Product[]>([]);
  const [loading,     setLoading]     = useState(true);

  // fetch all products once on mount
  useEffect(() => {
    getProducts({ page_size: 100 })
      .then((d) => setAllProducts(d.items))
      .finally(() => setLoading(false));
  }, []);

  // check for returning state after products loaded
  useEffect(() => {
    if (loading) return;
    const stored = loadRitual();
    if (!stored) return;

    const prevProds = allProducts.filter((p) => stored.resultIds.includes(p.id));
    if (prevProds.length > 0) {
      setPrevAnswers(stored.answers);
      setPrevResult(prevProds);
      setPhase("returning");
    }
  }, [loading, allProducts]);

  function selectAnswer(value: string) {
    const q = RITUAL_QUESTIONS[step];
    const updated = { ...answers, [q.id]: value } as Partial<RitualAnswers>;
    setAnswers(updated);

    if (step < RITUAL_QUESTIONS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), ADVANCE_DELAY_MS);
    } else {
      // all 4 answered
      setTimeout(() => {
        setPhase("completing");
        const full = updated as RitualAnswers;
        const selected = selectRitual(allProducts, full);
        setTimeout(() => {
          setResult(selected);
          saveRitual({
            answers: full,
            resultIds: selected.map((p) => p.id),
            completedAt: new Date().toISOString(),
          });
          setPhase("result");
        }, 600);
      }, ADVANCE_DELAY_MS);
    }
  }

  function goBack() {
    if (step > 0) {
      setStep((s) => s - 1);
      const q = RITUAL_QUESTIONS[step];
      const updated = { ...answers };
      delete (updated as Record<string, unknown>)[q.id];
      setAnswers(updated);
    }
  }

  function resetAll() {
    clearRitual();
    setPhase("questions");
    setStep(0);
    setAnswers({});
    setResult([]);
    setPrevAnswers(null);
    setPrevResult([]);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div
          className="h-8 w-8 rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-accent)] animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">

        {/* Returning visitor */}
        {phase === "returning" && prevAnswers && (
          <motion.div
            key="returning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-ink-muted)] mb-2">
              YOUR LAST RITUAL
            </p>
            <ResultStrip
              products={prevResult}
              answers={prevAnswers}
              onReset={resetAll}
              reducedMotion={reducedMotion}
            />
            <button
              onClick={resetAll}
              className="mt-6 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              Start a new ritual →
            </button>
          </motion.div>
        )}

        {/* Question flow */}
        {phase === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionCard
              question={RITUAL_QUESTIONS[step]}
              index={step}
              total={RITUAL_QUESTIONS.length}
              selected={(answers as Record<string, string>)[RITUAL_QUESTIONS[step].id] ?? null}
              onSelect={selectAnswer}
              onBack={goBack}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        )}

        {/* Composing */}
        {phase === "completing" && (
          <motion.div
            key="completing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <p className="font-display italic text-xl text-[var(--color-ink-soft)]">
              Composing your ritual…
            </p>
          </motion.div>
        )}

        {/* Result */}
        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ResultStrip
              products={result}
              answers={answers as RitualAnswers}
              onReset={resetAll}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
