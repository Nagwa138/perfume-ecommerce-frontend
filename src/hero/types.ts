// src/hero/types.ts
// Single source of truth for the four HOSSAM STREET beats.
// StreetScene places the storefront at BEAT_META[i].z.
// HeroOverlay shows BEAT_META[i].title / sub / ctaLabel linking to shopQuery.
// AvatarMesh turns toward camera at BEAT_META[i].at.

export const SCROLL_SCALE = 3 as const; // 400vh container − 100vh viewport = 300vh of travel

export type BeatId = "fragrance" | "makeup" | "skincare" | "pharmacy";

export type Beat = {
  id: BeatId;
  /** 0–1 scroll progress at which the avatar slows and turns to camera */
  at: number;
  /** Emissive sign text rendered on the storefront (canvas texture) */
  sign: string;
  /** Big caption shown in the DOM overlay */
  title: string;
  /** One-line subtitle under the title */
  sub: string;
  /** Route the CTA links to (uses ShopPage's product_type query key) */
  shopQuery: string;
  /** CTA button label */
  ctaLabel: string;
  /** World-space Z of the storefront (negative = farther down the street) */
  z: number;
  /** Sign emissive colour (hex) */
  color: string;
};

export const BEATS: Beat[] = [
  {
    id: "fragrance",
    at: 0.20,
    sign: "PERFUMERY",
    title: "Fragrance",
    sub: "Niche perfumes & signature scents",
    shopQuery: "/shop?product_type=perfume",
    ctaLabel: "Explore Fragrance",
    z: -11,
    color: "#D9B979",
  },
  {
    id: "makeup",
    at: 0.40,
    sign: "MAKEUP",
    title: "Makeup",
    sub: "Complexion, lips & eyes",
    shopQuery: "/shop?product_type=makeup",
    ctaLabel: "Explore Makeup",
    z: -23,
    color: "#D8A18B",
  },
  {
    id: "skincare",
    at: 0.60,
    sign: "SKINCARE",
    title: "Skincare",
    sub: "Serums, moisturisers & rituals",
    shopQuery: "/shop?product_type=skincare",
    ctaLabel: "Explore Skincare",
    z: -35,
    color: "#A8C8B8",
  },
  {
    id: "pharmacy",
    at: 0.80,
    sign: "PHARMACY",
    title: "Pharmacy & Wellness",
    sub: "Sun care, supplements & daily essentials",
    shopQuery: "/shop?product_type=pharmacy-wellness",
    ctaLabel: "Explore Wellness",
    z: -47,
    color: "#7EC8A0", // green cross glow
  },
];

/** HOSSAM main storefront sits past the last beat, at the end of the street. */
export const MAIN_STORE_Z = -60;
export const MAIN_DOORS_OPEN_AT = 0.94; // scroll progress when doors swing open