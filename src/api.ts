export const API = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8002/api";
export const ADMIN_API = `${API}/admin`;

export const EGP_RATE = 50;
export const fmtEGP = (usd: number): string =>
  `EGP ${Math.round(usd * EGP_RATE).toLocaleString("en-EG")}`;
export const FREE_SHIPPING_USD = 50;
export const SHIPPING_USD = 1.5;

export type Product = {
  id: number; slug: string; name: string; brand: string;
  department: string; category: string; subcategory: string;
  price: number; sale_price: number | null;
  stock: number; description: string; details: string[] | null;
  fit: string; fabric: string; materials: string;
  season: string; collection: string; care_instructions: string;
  sizes: string[] | null;
  colors: { name: string; hex: string }[] | null;
  images: string[] | null; tags: string[] | null;
  rating: number; review_count: number;
  is_new: boolean; is_featured: boolean; is_active: boolean;
  image: string; color: string;
};

export type Facets = {
  departments:   Record<string, number>;
  categories:    Record<string, number>;
  subcategories: Record<string, number>;
  fits:          Record<string, number>;
  collections:   Record<string, number>;
  sizes:         Record<string, number>;
  price_range:   { min: number; max: number };
};

export type ProductsPage = {
  items: Product[]; total: number; pages: number; facets: Facets;
};

export type Review = {
  id: number; product_id: number; author: string;
  rating: number; title: string; body: string; date: string;
};

export type OrderSummary = {
  order_id: number; total: number; discount: number;
};

export type OrderItem = {
  id: number; order_id: number; product_id: number;
  product_name: string; size: string; color: string;
  qty: number; price: number;
};

export type AdminOrder = {
  id: number; status: string; customer_name: string;
  customer_email: string; customer_phone: string; customer_address: string;
  subtotal: number; shipping: number; discount: number; total: number;
  coupon_code: string; payment_method: string; created_at: string;
  items: OrderItem[];
};

export type AdminUser = {
  username: string; role: string; last_login: string | null;
};

// ── taxonomy ──────────────────────────────────────────────────────────────────
export const getTaxonomy = (): Promise<Record<string, Record<string, string[]>>> =>
  fetch(`${API}/taxonomy`)
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));

// ── products ──────────────────────────────────────────────────────────────────
const EMPTY_PAGE: ProductsPage = {
  items: [], total: 0, pages: 0,
  facets: { departments: {}, categories: {}, subcategories: {}, fits: {},
            collections: {}, sizes: {}, price_range: { min: 0, max: 0 } },
};

export const getProducts = (params?: {
  department?: string; category?: string; subcategory?: string;
  fit?: string; collection?: string; size?: string; color?: string;
  q?: string; page?: number; page_size?: number;
  sort?: string; on_sale?: boolean; in_stock?: boolean;
  min_price?: number; max_price?: number;
}): Promise<ProductsPage> => {
  const qs = new URLSearchParams();
  if (params?.department)  qs.set("department",  params.department);
  if (params?.category)    qs.set("category",    params.category);
  if (params?.subcategory) qs.set("subcategory", params.subcategory);
  if (params?.fit)         qs.set("fit",          params.fit);
  if (params?.collection)  qs.set("collection",  params.collection);
  if (params?.size)        qs.set("size",         params.size);
  if (params?.color)       qs.set("color",        params.color);
  if (params?.q)           qs.set("q",            params.q);
  if (params?.page)        qs.set("page",         String(params.page));
  if (params?.page_size)   qs.set("page_size",    String(params.page_size));
  if (params?.sort)        qs.set("sort",         params.sort);
  if (params?.on_sale)     qs.set("on_sale",      "true");
  if (params?.in_stock)    qs.set("in_stock",     "true");
  if (params?.min_price != null) qs.set("min_price", String(params.min_price));
  if (params?.max_price != null) qs.set("max_price", String(params.max_price));
  const url = `${API}/products${qs.size ? `?${qs}` : ""}`;
  return fetch(url)
    .then((r) => (r.ok ? r.json() : EMPTY_PAGE))
    .catch(() => EMPTY_PAGE);
};

export const getCategories = (): Promise<string[]> =>
  fetch(`${API}/categories`)
    .then((r) => (r.ok ? r.json() : []))
    .then((d) => (Array.isArray(d) ? d : []))
    .catch(() => []);

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

// ── orders ────────────────────────────────────────────────────────────────────
export const createOrder = (
  name: string, email: string, phone: string, address: string,
  items: { product_id: number; qty: number; size?: string; color?: string }[],
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

// ── admin auth helpers ────────────────────────────────────────────────────────
const TOKEN_KEY = "nw_admin_token";

export const saveToken = (token: string) => sessionStorage.setItem(TOKEN_KEY, token);
export const loadToken = () => sessionStorage.getItem(TOKEN_KEY);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

const adminHeaders = (): Record<string, string> => {
  const token = loadToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── admin auth API ────────────────────────────────────────────────────────────
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

// ── admin orders ─────────────────────────────────────────────────────────────
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

// ── coupons ───────────────────────────────────────────────────────────────────
export const validateCoupon = (code: string): Promise<{ code: string; percent: number } | null> =>
  fetch(`${API}/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
