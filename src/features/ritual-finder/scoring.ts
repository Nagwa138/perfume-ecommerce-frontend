import type { Product } from "../../api";
import type { RitualAnswers } from "./questions";
import { deriveTags } from "./tagging";

function matches(tags: string[], answer: string): number {
  return tags.includes(answer) ? 1 : 0;
}

export function scoreProduct(product: Product, answers: RitualAnswers): number {
  const t = deriveTags(product);

  const concernScore =
    answers.concern === "universal"
      ? 4
      : 4 * matches(t.concern, answers.concern);

  const moodScore =
    answers.mood === "neutral"           // "neutral" is a tag, not a valid answer
      ? 0
      : 3 * matches(t.mood, answers.mood);

  const timeScore =
    2 * matches(t.time, answers.time);

  const intentScore =
    answers.intent === "curious"
      ? 2
      : 2 * matches(t.intent, answers.intent);

  return concernScore + moodScore + timeScore + intentScore;
}

export function selectRitual(products: Product[], answers: RitualAnswers): Product[] {
  if (products.length === 0) return [];

  const scored = products.map((p) => ({
    product: p,
    score: scoreProduct(p, answers),
  }));

  // sort: score desc → review_count desc → price desc
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.product.review_count !== a.product.review_count) {
      return b.product.review_count - a.product.review_count;
    }
    const priceA = a.product.sale_price ?? (a.product.sizes?.[0]?.price ?? 0);
    const priceB = b.product.sale_price ?? (b.product.sizes?.[0]?.price ?? 0);
    return priceB - priceA;
  });

  // enforce category diversity: no more than 3 from the same product_type
  const result: Product[] = [];
  const typeCounts: Record<string, number> = {};

  for (const { product } of scored) {
    const pt = product.product_type ?? "unknown";
    const count = typeCounts[pt] ?? 0;
    if (count < 3) {
      result.push(product);
      typeCounts[pt] = count + 1;
    }
    if (result.length === 5) break;
  }

  // pad to 5 if diversity filter removed too many
  if (result.length < 5) {
    for (const { product } of scored) {
      if (!result.includes(product)) {
        result.push(product);
      }
      if (result.length === 5) break;
    }
  }

  return result.slice(0, 5);
}
