export const BRAND = {
  name:       "Hossam",
  nameUpper:  "HOSSAM",
  tagline:    "Beauty, rooted in ritual.",
  taglineAr:  "الجمال، متجذّر في الطقوس.",
  domain:     "hossam.beauty",
  email:      "hello@hossam.beauty",
  instagram:  "https://instagram.com/hossambeauty",
  twitter:    "https://x.com/hossambeauty",
  pinterest:  "https://pinterest.com/hossambeauty",
} as const;

export type BrandName = typeof BRAND.name;
