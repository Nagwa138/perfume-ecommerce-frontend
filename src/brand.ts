export const BRAND = {
  name:      "H STORE",
  nameUpper: "H STORE",
  tagline:   "Niche & designer fragrances, beauty, and gifts in Cairo.",
  taglineAr: "عطور نيش وديزاينر، تجميل وهدايا — القاهرة.",
  domain:    "hstoresegy.com",
} as const;

export type BrandName = typeof BRAND.name;
