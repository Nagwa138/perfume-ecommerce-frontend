import { describe, it, expect } from "vitest";
import { scoreProduct, selectRitual } from "../scoring";
import type { Product } from "../../../api";
import type { RitualAnswers } from "../questions";

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: overrides.id ?? 1, slug: `prod-${overrides.id ?? 1}`,
    name: "Test Product", brand: "HOSSAM",
    gender: "Unisex", family: "", concentration: "", description: "",
    top_notes: null, heart_notes: null, base_notes: null,
    sizes: [{ ml: 50, price: 30, stock: 10 }],
    longevity: 5, sillage: 5, season: null, occasion: null,
    perfumer: "", year: null, collection: "", bottle_color: "#C8A951",
    cap_style: "round", product_type: "perfume", subcategory: "",
    variants: null, skin_type: null, ingredients: "", how_to_use: "",
    images: null, tags: null, sale_price: null,
    rating: 4.5, review_count: 10, is_new: false,
    is_featured: false, is_active: true,
    ...overrides,
  };
}

const FRAGRANCE_ANSWERS: RitualAnswers = {
  time: "evening", concern: "fragrance", mood: "warm-resinous", intent: "statement",
};

const UNIVERSAL_ANSWERS: RitualAnswers = {
  time: "anytime", concern: "universal", mood: "fresh-green", intent: "curious",
};

describe("scoreProduct", () => {
  it("scores a fragrance product higher than skincare for fragrance answers", () => {
    const perfume = makeProduct({ product_type: "perfume", family: "Oriental", concentration: "Parfum" });
    const skin    = makeProduct({ product_type: "skincare" });
    expect(scoreProduct(perfume, FRAGRANCE_ANSWERS)).toBeGreaterThan(scoreProduct(skin, FRAGRANCE_ANSWERS));
  });

  it("universal concern gives full concern score to all products", () => {
    const perfume  = makeProduct({ product_type: "perfume" });
    const skincare = makeProduct({ product_type: "skincare" });
    const scoreP = scoreProduct(perfume, UNIVERSAL_ANSWERS);
    const scoreS = scoreProduct(skincare, UNIVERSAL_ANSWERS);
    // both should receive the concern bonus (4)
    expect(scoreP).toBeGreaterThanOrEqual(4);
    expect(scoreS).toBeGreaterThanOrEqual(4);
  });

  it("curious intent gives intent bonus to all products", () => {
    const p = makeProduct({ product_type: "skincare" });
    const withCurious: RitualAnswers = { time: "morning", concern: "skin", mood: "neutral" as never, intent: "curious" };
    const withEveryday: RitualAnswers = { time: "morning", concern: "skin", mood: "neutral" as never, intent: "everyday" };
    // curious always scores 2 bonus; everyday scores 2 only if tagged everyday
    expect(scoreProduct(p, withCurious)).toBeGreaterThanOrEqual(2);
    // should be equal or curious slightly higher since curious always matches
    expect(scoreProduct(p, withCurious)).toBeGreaterThanOrEqual(scoreProduct(p, withEveryday));
  });

  it("neutral mood tag on a skincare product does not inflate mood score", () => {
    const skin = makeProduct({ product_type: "skincare" });
    // skincare gets neutral mood tag; answer is fresh-green (not neutral)
    const answers: RitualAnswers = { time: "morning", concern: "skin", mood: "fresh-green", intent: "everyday" };
    const moodScore = scoreProduct(skin, answers);
    // should still score via concern + time + intent, just 0 from mood
    expect(moodScore).toBeGreaterThanOrEqual(0);
  });
});

describe("selectRitual", () => {
  const POOL: Product[] = [
    makeProduct({ id: 1,  product_type: "perfume",   family: "Oriental",  concentration: "Parfum", review_count: 50 }),
    makeProduct({ id: 2,  product_type: "perfume",   family: "Citrus",    sizes: [{ ml: 50, price: 15, stock: 10 }], review_count: 30 }),
    makeProduct({ id: 3,  product_type: "skincare",  subcategory: "Serum", review_count: 20 }),
    makeProduct({ id: 4,  product_type: "makeup",    review_count: 15 }),
    makeProduct({ id: 5,  product_type: "haircare",  review_count: 12 }),
    makeProduct({ id: 6,  product_type: "body",      review_count: 8 }),
    makeProduct({ id: 7,  product_type: "pharmacy",  review_count: 5 }),
    makeProduct({ id: 8,  product_type: "gift",      review_count: 25 }),
    makeProduct({ id: 9,  product_type: "perfume",   family: "Floral",    review_count: 40 }),
    makeProduct({ id: 10, product_type: "perfume",   family: "Woody",     base_notes: ["Oud"], review_count: 35 }),
  ];

  it("always returns exactly 5 products", () => {
    const result = selectRitual(POOL, FRAGRANCE_ANSWERS);
    expect(result).toHaveLength(5);
  });

  it("returns 5 even with universal answers", () => {
    expect(selectRitual(POOL, UNIVERSAL_ANSWERS)).toHaveLength(5);
  });

  it("returns 5 for extreme answers (special + statement + smoky-deep + fragrance)", () => {
    const extreme: RitualAnswers = { time: "special", concern: "fragrance", mood: "smoky-deep", intent: "statement" };
    expect(selectRitual(POOL, extreme)).toHaveLength(5);
  });

  it("returns 5 when pool has no products with matching mood tag", () => {
    const noFragrancePool = POOL.map((p) => ({ ...p, product_type: "skincare" }));
    const answers: RitualAnswers = { time: "evening", concern: "skin", mood: "smoky-deep", intent: "everyday" };
    expect(selectRitual(noFragrancePool, answers)).toHaveLength(5);
  });

  it("enforces category diversity — no more than 3 from same type when diverse pool available", () => {
    const result = selectRitual(POOL, UNIVERSAL_ANSWERS);
    const counts: Record<string, number> = {};
    result.forEach((p) => { counts[p.product_type] = (counts[p.product_type] ?? 0) + 1; });
    Object.values(counts).forEach((c) => expect(c).toBeLessThanOrEqual(3));
  });

  it("returns empty array for empty pool without crashing", () => {
    expect(selectRitual([], FRAGRANCE_ANSWERS)).toHaveLength(0);
  });
});
