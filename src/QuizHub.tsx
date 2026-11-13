/**
 * QuizHub.tsx  —  /quiz
 * Landing page linking to the two beauty quizzes and a shade-finder teaser.
 * Like Laravel's view composer that injects shared layout data — this page
 * simply routes traffic to its sub-quizzes without any API calls of its own.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FlaskConical, Sparkles, Palette } from "lucide-react";
import { BRAND } from "./brand";

const QUIZZES = [
  {
    to:    "/quiz/fragrance",
    icon:  <FlaskConical size={28} />,
    label: "Find Your Fragrance",
    sub:   "5 questions · Personalised scent match",
    color: "#C8A951",
    desc:  "Discover your perfect perfume based on your mood, style and occasions. We'll match you to a family and curate your top picks.",
  },
  {
    to:    "/quiz/skincare",
    icon:  <Sparkles size={28} />,
    label: "Build Your Routine",
    sub:   "4 questions · Personalised skincare plan",
    color: "#a0c4b8",
    desc:  "Tell us your skin type and concerns and we'll build a morning and evening ritual from real products in our catalogue.",
  },
  {
    to:    "/quiz/shade-finder",
    icon:  <Palette size={28} />,
    label: "Shade Finder",
    sub:   "Coming soon",
    color: "#d4a0a0",
    desc:  "Find your perfect foundation match, lip shade and blush colour. Advanced undertone matching — launching soon.",
    soon:  true,
  },
];

export default function QuizHub() {
  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-28">
      <div className="mb-14 text-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          Personalised Beauty
        </p>
        <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
          Find Your Perfect Match
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted">
          Answer a few questions and let {BRAND.name} curate your ideal products from our catalogue.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {QUIZZES.map((q, i) => (
          <motion.div
            key={q.to}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            {q.soon ? (
              <div className="relative h-full cursor-not-allowed rounded-2xl border border-border bg-surface-2 p-6 opacity-60">
                <span className="absolute right-4 top-4 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Soon
                </span>
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${q.color}22`, color: q.color }}
                >
                  {q.icon}
                </div>
                <p className="font-display text-xl font-bold">{q.label}</p>
                <p className="mt-1 text-xs text-muted">{q.sub}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{q.desc}</p>
              </div>
            ) : (
              <Link
                to={q.to}
                className="group relative block h-full rounded-2xl border border-border bg-surface-2 p-6 transition-all hover:border-accent/40 hover:bg-surface-2/80"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                  style={{ background: `${q.color}22`, color: q.color }}
                >
                  {q.icon}
                </div>
                <p className="font-display text-xl font-bold group-hover:text-accent transition-colors">
                  {q.label}
                </p>
                <p className="mt-1 text-xs text-muted">{q.sub}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{q.desc}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Take the quiz →
                </div>
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </main>
  );
}
