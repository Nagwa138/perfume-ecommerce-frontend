export const API = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api";
export const ADMIN_API = `${API}/admin`;

export const EGP_RATE = 50;
export const fmtEGP = (usd: number): string =>
  `EGP ${Math.round(usd * EGP_RATE).toLocaleString("en-EG")}`;
export const FREE_SHIPPING_USD = 30;
export const SHIPPING_USD = 1.5;

// ── Beauty product types ───────────────────────────────────────────────────────

export type PerfumeSize   = { ml: number; price: number; stock: number };
export type ShadeVariant  = { name: string; shade_hex: string; stock: number };

export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  // ── Fragrance taxonomy ──────────────────────────────────────────────────────
  gender: string;           // Women | Men | Unisex
  family: string;           // Floral | Woody | Oriental/Amber | …
  concentration: string;    // Parfum | Eau de Parfum | Eau de Toilette | Eau de Cologne
  top_notes: string[] | null;
  heart_notes: string[] | null;
  base_notes: string[] | null;
  sizes: PerfumeSize[] | null;
  longevity: number;        // 1–10
  sillage: number;          // 1–10
  season: string[] | null;
  occasion: string[] | null;
  perfumer: string;
  year: number | null;
  description: string;
  collection: string;
  bottle_color: string;     // hex colour for liquid mesh
  cap_style: string;        // round | square | tall
  // ── Product classification ──────────────────────────────────────────────────
  product_type: string;     // perfume | skincare | makeup | haircare | body
  subcategory: string;      // Serum / Foundation / Shampoo / Body Cream / …
  // ── Cosmetic fields ─────────────────────────────────────────────────────────
  variants: ShadeVariant[] | null;   // makeup shade variants
  skin_type: string[] | null;        // dry | oily | combination | sensitive | normal | all
  ingredients: string;
  how_to_use: string;
  // ── Media / pricing / flags ─────────────────────────────────────────────────
  images: string[] | null;
  tags: string[] | null;
  sale_price: number | null;
  rating: number;
  review_count: number;
  is_new: boolean;
  is_featured: boolean;
  is_active: boolean;
};

export type Facets = {
  product_types:  Record<string, number>;
  subcategories:  Record<string, number>;
  genders:        Record<string, number>;
  families:       Record<string, number>;
  concentrations: Record<string, number>;
  collections:    Record<string, number>;
  notes:          Record<string, number>;
  sizes:          Record<string, number>;
  seasons:        Record<string, number>;
  occasions:      Record<string, number>;
  skin_types:     Record<string, number>;
  price_range:    { min: number; max: number };
};

export type ProductsPage = {
  items: Product[];
  total: number;
  pages: number;
  facets: Facets;
};

export type Review = {
  id: number;
  product_id: number;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

export type ProductVariant = {
  id: number;
  product_id: number;
  kind: string;      // shade | size | bundle
  label: string;     // display name e.g. "Rose Petal"
  shade_hex: string; // #RRGGBB
  undertone: string; // warm | cool | neutral
  price: number;
  stock: number;
  sku: string;
  image: string;
};

export type OrderSummary = { order_id: number; total: number; discount: number };

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  size_ml: number;
  qty: number;
  price: number;
};

export type AdminOrder = {
  id: number;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
};

export type AdminUser = { username: string; role: string; last_login: string | null };

// ── Taxonomy ──────────────────────────────────────────────────────────────────

export const getTaxonomy = (): Promise<Record<string, Record<string, string[]>>> =>
  fetch(`${API}/taxonomy`)
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));

// ── Products ──────────────────────────────────────────────────────────────────

const EMPTY_FACETS: Facets = {
  product_types: {}, subcategories: {},
  genders: {}, families: {}, concentrations: {}, collections: {},
  notes: {}, sizes: {}, seasons: {}, occasions: {}, skin_types: {},
  price_range: { min: 0, max: 0 },
};

const EMPTY_PAGE: ProductsPage = { items: [], total: 0, pages: 0, facets: EMPTY_FACETS };

export type ProductsParams = {
  q?: string;
  product_type?: string;
  subcategory?: string;
  gender?: string;
  family?: string;
  concentration?: string;
  collection?: string;
  note?: string;
  size_ml?: number;
  season?: string;
  occasion?: string;
  skin_type?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  sort?: string;
  page?: number;
  page_size?: number;
};

export const getProducts = (params?: ProductsParams): Promise<ProductsPage> => {
  const qs = new URLSearchParams();
  if (params?.q)             qs.set("q",             params.q);
  if (params?.product_type)  qs.set("product_type",  params.product_type);
  if (params?.subcategory)   qs.set("subcategory",   params.subcategory);
  if (params?.gender)        qs.set("gender",        params.gender);
  if (params?.family)        qs.set("family",        params.family);
  if (params?.concentration) qs.set("concentration", params.concentration);
  if (params?.collection)    qs.set("collection",    params.collection);
  if (params?.note)          qs.set("note",          params.note);
  if (params?.size_ml != null) qs.set("size_ml",     String(params.size_ml));
  if (params?.season)        qs.set("season",        params.season);
  if (params?.occasion)      qs.set("occasion",      params.occasion);
  if (params?.skin_type)     qs.set("skin_type",     params.skin_type);
  if (params?.min_price != null) qs.set("min_price", String(params.min_price));
  if (params?.max_price != null) qs.set("max_price", String(params.max_price));
  if (params?.in_stock)      qs.set("in_stock",      "true");
  if (params?.on_sale)       qs.set("on_sale",       "true");
  if (params?.sort)          qs.set("sort",          params.sort);
  if (params?.page)          qs.set("page",          String(params.page));
  if (params?.page_size)     qs.set("page_size",     String(params.page_size));
  const url = `${API}/products${qs.size ? `?${qs}` : ""}`;
  return fetch(url)
    .then((r) => (r.ok ? r.json() : EMPTY_PAGE))
    .catch(() => EMPTY_PAGE);
};

export const getProduct = (slugOrId: string): Promise<Product | null> =>
  fetch(`${API}/products/${slugOrId}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

export const getReviews = (slug: string): Promise<Review[]> =>
  fetch(`${API}/products/${slug}/reviews`)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);

export const getRelated = (slug: string): Promise<Product[]> =>
  fetch(`${API}/products/${slug}/related`)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);

export const getProductVariants = (slug: string): Promise<ProductVariant[]> =>
  fetch(`${API}/products/${slug}/variants`)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);

export type TopReview = {
  id: number;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  product_name: string;
  product_slug: string;
};

export const getTopReviews = (limit = 9): Promise<TopReview[]> =>
  fetch(`${API}/reviews/top?limit=${limit}`)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);

// ── Orders ────────────────────────────────────────────────────────────────────

export const createOrder = (
  name: string, email: string, phone: string, address: string,
  items: { product_id: number; qty: number; size_ml: number; variant_id?: number | null }[],
  coupon_code?: string,
  payment_method?: string,
): Promise<OrderSummary> =>
  fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: name, customer_email: email,
      customer_phone: phone, customer_address: address,
      items, coupon_code, payment_method: payment_method ?? "cod",
    }),
  }).then((r) => r.json());

export const getOrder = (id: number, email: string) =>
  fetch(`${API}/orders/${id}?email=${encodeURIComponent(email)}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

// ── Coupons ───────────────────────────────────────────────────────────────────

export const validateCoupon = (code: string): Promise<{ code: string; percent: number } | null> =>
  fetch(`${API}/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

// ── Admin auth helpers ────────────────────────────────────────────────────────

const TOKEN_KEY = "aura_admin_token";
export const saveToken  = (t: string) => sessionStorage.setItem(TOKEN_KEY, t);
export const loadToken  = () => sessionStorage.getItem(TOKEN_KEY);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

const adminHeaders = (): Record<string, string> => {
  const token = loadToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── Admin auth API ────────────────────────────────────────────────────────────

export const adminLogin = (
  username: string, password: string
): Promise<{ access_token: string; role: string; username: string } | null> =>
  fetch(`${ADMIN_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

export const adminGetMe = (): Promise<AdminUser | null> =>
  fetch(`${ADMIN_API}/me`, { headers: adminHeaders() })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

// ── Admin orders ──────────────────────────────────────────────────────────────

export const getAdminOrders = (): Promise<AdminOrder[]> =>
  fetch(`${ADMIN_API}/orders`, { headers: adminHeaders() })
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);

export const updateOrderStatus = (id: number, status: string): Promise<void> =>
  fetch(`${ADMIN_API}/orders/${id}/status`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ status }),
  }).then(() => undefined);

// ── Admin analytics ───────────────────────────────────────────────────────────

export type Analytics = {
  revenue_by_type:  Record<string, number>;
  units_by_type:    Record<string, number>;
  orders_by_status: Record<string, number>;
  top_products:     Array<{ id: number; name: string; product_type: string; units: number }>;
  total_revenue:    number;
  total_orders:     number;
};

export const getAnalytics = (): Promise<Analytics | null> =>
  fetch(`${ADMIN_API}/analytics`, { headers: adminHeaders() })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

// ── Admin create product ──────────────────────────────────────────────────────

export type ProductDraft = {
  name: string; brand: string; product_type: string; subcategory?: string;
  gender?: string; family?: string; concentration?: string; description?: string;
  sizes?: Array<{ ml: number; price: number; stock: number }>;
  variants?: Array<{ name: string; shade_hex: string; stock: number }>;
  skin_type?: string[]; ingredients?: string; how_to_use?: string;
  longevity?: number; sillage?: number; bottle_color?: string; cap_style?: string;
  season?: string[]; occasion?: string[]; collection?: string;
};

export const adminCreateProduct = (draft: ProductDraft): Promise<{ created_id: number; slug: string } | null> =>
  fetch(`${ADMIN_API}/products`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(draft),
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
