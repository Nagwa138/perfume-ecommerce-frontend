export const BRAND = {
  name:       "Hossam",
  nameUpper:  "HOSSAM",
  tagline:    "Luxury Beauty, Curated",
  taglineAr:  "الجمال الفاخر، باختيار مميز",
  domain:     "hossam.beauty",
  email:      "hello@hossam.beauty",
  instagram:  "https://instagram.com/hossambeauty",
  twitter:    "https://x.com/hossambeauty",
  pinterest:  "https://pinterest.com/hossambeauty",
} as const;

export type BrandName = typeof BRAND.name;
