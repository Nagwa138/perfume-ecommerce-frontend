import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./api";

type RecentState = {
  products: Product[];
  track: (p: Product) => void;
};

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      products: [],
      track: (p) =>
        set((s) => ({
          products: [p, ...s.products.filter((x) => x.id !== p.id)].slice(0, 8),
        })),
    }),
    { name: "aura-recent", partialize: (s) => ({ products: s.products }) }
  )
);

export type Line = {
  product: Product;
  qty: number;
  size_ml: number;          // chosen size in ml (0 for shade variants)
  variant_id: number | null; // ProductVariant.id for makeup shade orders
  variant_label: string;    // shade display name, empty when not a shade variant
};

type CartState = {
  lines: Line[];
  open: boolean;
  add: (p: Product, size_ml: number, variant_id?: number | null, variant_label?: string) => void;
  remove: (productId: number, size_ml: number, variant_id?: number | null) => void;
  setQty: (productId: number, size_ml: number, qty: number, variant_id?: number | null) => void;
  toggle: () => void;
  clear: () => void;
};

// variant_id ?? null normalises old persisted entries that have variant_id: undefined
const sameKey = (a: Line, productId: number, size_ml: number, variant_id: number | null = null) =>
  a.product.id === productId && a.size_ml === size_ml && (a.variant_id ?? null) === variant_id;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (p, size_ml, variant_id = null, variant_label = "") =>
        set((s) => {
          const ex = s.lines.find((l) => sameKey(l, p.id, size_ml, variant_id));
          return {
            open: true,
            lines: ex
              ? s.lines.map((l) =>
                  sameKey(l, p.id, size_ml, variant_id) ? { ...l, qty: l.qty + 1 } : l
                )
              : [...s.lines, { product: p, qty: 1, size_ml, variant_id: variant_id ?? null, variant_label }],
          };
        }),
      remove: (productId, size_ml, variant_id = null) =>
        set((s) => ({
          lines: s.lines.filter((l) => !sameKey(l, productId, size_ml, variant_id)),
        })),
      setQty: (productId, size_ml, qty, variant_id = null) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => !sameKey(l, productId, size_ml, variant_id))
              : s.lines.map((l) =>
                  sameKey(l, productId, size_ml, variant_id) ? { ...l, qty } : l
                ),
        })),
      toggle: () => set((s) => ({ open: !s.open })),
      clear: () => set({ lines: [], open: false }),
    }),
    { name: "aura-cart", partialize: (s) => ({ lines: s.lines }) }
  )
);

type WishlistState = {
  ids: number[];
  toggle: (id: number) => void;
  has: (id: number) => boolean;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "aura-wishlist" }
  )
);
