import type { Product } from "../../api";
import type { TimeTag, ConcernTag, MoodTag, IntentTag } from "./questions";

export type DerivedTags = {
  time:    TimeTag[];
  concern: ConcernTag[];
  mood:    MoodTag[];
  intent:  IntentTag[];
};

// ── helpers ───────────────────────────────────────────────────────────────────

function anyOf(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n));
}

function notesContain(product: Product, needles: string[]): boolean {
  const all = [
    ...(product.top_notes   ?? []),
    ...(product.heart_notes ?? []),
    ...(product.base_notes  ?? []),
  ].map((n) => n.toLowerCase());
  return needles.some((n) => all.some((note) => note.includes(n)));
}

function minPrice(product: Product): number {
  if (product.sale_price != null) return product.sale_price;
  if (product.sizes && product.sizes.length > 0) {
    return Math.min(...product.sizes.map((s) => s.price));
  }
  return 0;
}

// ── tag derivation ────────────────────────────────────────────────────────────

function deriveTime(product: Product): TimeTag[] {
  const tags = new Set<TimeTag>();
  const text = `${product.name} ${product.description} ${product.subcategory}`.toLowerCase();
  const occ = (product.occasion ?? []).map((o) => o.toLowerCase());
  const conc = product.concentration?.toLowerCase() ?? "";

  // occasion signals
  if (occ.some((o) => o.includes("evening") || o.includes("night") || o.includes("after dark"))) {
    tags.add("evening");
  }
  if (occ.some((o) => o.includes("daytime") || o.includes("day") || o.includes("work") || o.includes("office"))) {
    tags.add("morning");
  }
  if (occ.some((o) => o.includes("special") || o.includes("wedding") || o.includes("formal") || o.includes("gala"))) {
    tags.add("special");
  }

  // concentration signals
  if (anyOf(conc, ["parfum", "extrait"])) { tags.add("evening"); tags.add("special"); }
  if (anyOf(conc, ["toilette", "cologne"])) { tags.add("morning"); }

  // name/desc keywords
  if (anyOf(text, ["night", "nuit", "soir", "nocturnal", "dusk", "midnight"])) tags.add("evening");
  if (anyOf(text, ["spf", "sunscreen", "day cream", "morning", "matin", "daily"])) tags.add("morning");
  if (anyOf(text, ["retinol", "repair", "overnight", "night cream", "sleeping"])) tags.add("evening");
  if (anyOf(text, ["special", "ceremony", "celebration", "occasion"])) tags.add("special");

  // fragrance notes
  if (notesContain(product, ["oud", "tobacco", "leather", "incense", "myrrh", "amber"])) tags.add("evening");
  if (notesContain(product, ["bergamot", "lemon", "grapefruit", "citrus", "tea", "basil"])) tags.add("morning");

  // non-fragrance product types
  const pt = product.product_type?.toLowerCase() ?? "";
  if (pt === "makeup") tags.add("anytime");
  if (pt === "haircare") tags.add("anytime");
  if (pt === "body") tags.add("anytime");
  if (pt === "gift") { tags.add("special"); tags.add("anytime"); }
  if (pt === "pharmacy") { tags.add("morning"); }

  // fallback
  if (tags.size === 0) tags.add("anytime");
  return [...tags];
}

function deriveConcern(product: Product): ConcernTag[] {
  const pt = product.product_type?.toLowerCase() ?? "";
  const sub = product.subcategory?.toLowerCase() ?? "";

  if (pt === "perfume") return ["fragrance"];
  if (pt === "skincare") return ["skin"];
  if (pt === "makeup") return ["skin"];
  if (pt === "haircare") return ["hair"];
  if (pt === "body") return ["body"];
  if (pt === "pharmacy") return ["skin"];
  if (pt === "gift") {
    // peek at subcategory to guess contents
    if (anyOf(sub, ["fragrance", "perfume", "scent"])) return ["fragrance", "giftable" as unknown as ConcernTag];
    if (anyOf(sub, ["skin", "face", "serum"])) return ["skin"];
    if (anyOf(sub, ["hair"])) return ["hair"];
    if (anyOf(sub, ["body", "bath"])) return ["body"];
    return ["universal"];
  }
  return ["universal"];
}

function deriveMood(product: Product): MoodTag[] {
  const pt = product.product_type?.toLowerCase() ?? "";
  // mood is fragrance-only; non-fragrance gets neutral
  if (pt !== "perfume") return ["neutral"];

  const tags = new Set<MoodTag>();
  const family = product.family?.toLowerCase() ?? "";
  const text = `${product.name} ${product.description}`.toLowerCase();

  // family signals
  if (anyOf(family, ["floral", "powdery", "fruity floral"])) tags.add("floral-powdery");
  if (anyOf(family, ["oriental", "amber", "gourmand", "vanilla", "balsamic"])) tags.add("warm-resinous");
  if (anyOf(family, ["citrus", "fresh", "aquatic", "green", "herbal", "fougere"])) tags.add("fresh-green");
  if (anyOf(family, ["woody", "leather", "chypre", "smoky", "tobacco", "resinous"])) {
    // woody can go either warm-resinous or smoky depending on notes
    if (notesContain(product, ["smoke", "tobacco", "leather", "incense", "tar"])) {
      tags.add("smoky-deep");
    } else {
      tags.add("warm-resinous");
    }
  }

  // note signals
  if (notesContain(product, ["oud", "amber", "vanilla", "tonka", "benzoin", "labdanum", "musk"])) {
    tags.add("warm-resinous");
  }
  if (notesContain(product, ["rose", "jasmine", "peony", "iris", "violet", "lilac", "magnolia", "lily", "powder"])) {
    tags.add("floral-powdery");
  }
  if (notesContain(product, ["bergamot", "lemon", "lime", "grapefruit", "orange", "citrus", "basil", "tea", "green", "grass", "mint", "cucumber"])) {
    tags.add("fresh-green");
  }
  if (notesContain(product, ["smoke", "tobacco", "leather", "incense", "myrrh", "tar", "vetiver", "patchouli"])) {
    tags.add("smoky-deep");
  }

  // name/desc keywords
  if (anyOf(text, ["oud", "agarwood", "bakhoor"])) tags.add("warm-resinous");
  if (anyOf(text, ["rose", "jasmine", "floral", "bloom"])) tags.add("floral-powdery");
  if (anyOf(text, ["citrus", "fresh", "aquatic", "marine", "green"])) tags.add("fresh-green");
  if (anyOf(text, ["smoke", "dark", "noir", "tobacco", "leather"])) tags.add("smoky-deep");

  if (tags.size === 0) tags.add("neutral");
  return [...tags];
}

function deriveIntent(product: Product): IntentTag[] {
  const tags = new Set<IntentTag>();
  const pt = product.product_type?.toLowerCase() ?? "";
  const sub = product.subcategory?.toLowerCase() ?? "";
  const price = minPrice(product);
  const name = product.name.toLowerCase();

  // gift products are always giftable
  if (pt === "gift" || anyOf(sub, ["set", "kit", "bundle", "collection", "gift"])) {
    tags.add("giftable");
  }
  if (anyOf(name, ["set", "kit", "bundle", "collection", "gift"])) {
    tags.add("giftable");
  }

  // price thresholds (USD — DB stores USD; EGP_RATE = 50)
  if (price > 0 && price < 25) tags.add("everyday");
  if (price >= 100) tags.add("statement");

  // is_new → curiosity
  if (product.is_new) tags.add("curious");
  if (product.is_featured) tags.add("statement");

  // affordable everyday
  if (pt === "pharmacy" || pt === "haircare") tags.add("everyday");
  if (pt === "makeup") tags.add("everyday");

  // all products get curious (spec: "curious matches every product")
  tags.add("curious");

  // fallback for intent without other signals
  if (!tags.has("everyday") && !tags.has("statement") && !tags.has("giftable")) {
    tags.add("everyday");
  }

  return [...tags];
}

export function deriveTags(product: Product): DerivedTags {
  return {
    time:    deriveTime(product),
    concern: deriveConcern(product),
    mood:    deriveMood(product),
    intent:  deriveIntent(product),
  };
}
