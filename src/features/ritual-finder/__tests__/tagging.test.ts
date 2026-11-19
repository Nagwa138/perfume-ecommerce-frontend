import { describe, it, expect } from "vitest";
import { deriveTags } from "../tagging";
import type { Product } from "../../../api";

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: 1, slug: "test", name: "Test Product", brand: "HOSSAM",
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

describe("deriveTags — time group", () => {
  it("gives evening to Parfum concentration", () => {
    const tags = deriveTags(makeProduct({ concentration: "Parfum" }));
    expect(tags.time).toContain("evening");
  });

  it("gives morning to SPF product name", () => {
    const tags = deriveTags(makeProduct({ product_type: "pharmacy", name: "Daily SPF 50 Sunscreen" }));
    expect(tags.time).toContain("morning");
  });

  it("gives evening to retinol product", () => {
    const tags = deriveTags(makeProduct({ product_type: "skincare", name: "Retinol Night Repair Serum" }));
    expect(tags.time).toContain("evening");
  });

  it("gives special to formal occasion", () => {
    const tags = deriveTags(makeProduct({ occasion: ["Formal", "Evening"] }));
    expect(tags.time).toContain("special");
  });

  it("falls back to anytime for a neutral makeup product", () => {
    const tags = deriveTags(makeProduct({ product_type: "makeup", name: "Lipstick" }));
    expect(tags.time).toContain("anytime");
  });
});

describe("deriveTags — concern group", () => {
  it("maps perfume → fragrance", () => {
    expect(deriveTags(makeProduct({ product_type: "perfume" })).concern).toContain("fragrance");
  });

  it("maps skincare → skin", () => {
    expect(deriveTags(makeProduct({ product_type: "skincare" })).concern).toContain("skin");
  });

  it("maps haircare → hair", () => {
    expect(deriveTags(makeProduct({ product_type: "haircare" })).concern).toContain("hair");
  });

  it("maps body → body", () => {
    expect(deriveTags(makeProduct({ product_type: "body" })).concern).toContain("body");
  });

  it("maps pharmacy → skin", () => {
    expect(deriveTags(makeProduct({ product_type: "pharmacy" })).concern).toContain("skin");
  });

  it("maps gift with no subcategory → universal", () => {
    expect(deriveTags(makeProduct({ product_type: "gift", subcategory: "" })).concern).toContain("universal");
  });
});

describe("deriveTags — mood group", () => {
  it("gives fresh-green to citrus family", () => {
    const tags = deriveTags(makeProduct({ family: "Citrus" }));
    expect(tags.mood).toContain("fresh-green");
  });

  it("gives warm-resinous to Oriental/Amber family", () => {
    const tags = deriveTags(makeProduct({ family: "Oriental" }));
    expect(tags.mood).toContain("warm-resinous");
  });

  it("gives warm-resinous to oud base note", () => {
    const tags = deriveTags(makeProduct({ base_notes: ["Oud", "Sandalwood"] }));
    expect(tags.mood).toContain("warm-resinous");
  });

  it("gives floral-powdery to Floral family", () => {
    const tags = deriveTags(makeProduct({ family: "Floral" }));
    expect(tags.mood).toContain("floral-powdery");
  });

  it("gives smoky-deep to leather/tobacco notes", () => {
    const tags = deriveTags(makeProduct({ base_notes: ["Leather", "Tobacco"] }));
    expect(tags.mood).toContain("smoky-deep");
  });

  it("gives neutral to non-perfume products", () => {
    expect(deriveTags(makeProduct({ product_type: "skincare" })).mood).toContain("neutral");
    expect(deriveTags(makeProduct({ product_type: "pharmacy" })).mood).toContain("neutral");
    expect(deriveTags(makeProduct({ product_type: "haircare" })).mood).toContain("neutral");
  });
});

describe("deriveTags — intent group", () => {
  it("always contains curious", () => {
    const tags = deriveTags(makeProduct({ product_type: "perfume" }));
    expect(tags.intent).toContain("curious");
  });

  it("gives giftable to gift product type", () => {
    expect(deriveTags(makeProduct({ product_type: "gift" })).intent).toContain("giftable");
  });

  it("gives everyday to pharmacy", () => {
    expect(deriveTags(makeProduct({ product_type: "pharmacy" })).intent).toContain("everyday");
  });

  it("gives statement to high-price product", () => {
    const tags = deriveTags(makeProduct({ sizes: [{ ml: 100, price: 150, stock: 5 }] }));
    expect(tags.intent).toContain("statement");
  });

  it("gives everyday to low-price product", () => {
    const tags = deriveTags(makeProduct({ sizes: [{ ml: 30, price: 15, stock: 20 }] }));
    expect(tags.intent).toContain("everyday");
  });
});

describe("deriveTags — all groups always populated", () => {
  const TYPES = ["perfume", "skincare", "makeup", "haircare", "body", "gift", "pharmacy"];

  it.each(TYPES)("%s has at least one tag per group", (pt) => {
    const tags = deriveTags(makeProduct({ product_type: pt }));
    expect(tags.time.length).toBeGreaterThan(0);
    expect(tags.concern.length).toBeGreaterThan(0);
    expect(tags.mood.length).toBeGreaterThan(0);
    expect(tags.intent.length).toBeGreaterThan(0);
  });
});
