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
  size_ml: number;      // chosen size in ml
};

type CartState = {
  lines: Line[];
  open: boolean;
  add: (p: Product, size_ml: number) => void;
  remove: (productId: number, size_ml: number) => void;
  setQty: (productId: number, size_ml: number, qty: number) => void;
  toggle: () => void;
  clear: () => void;
};

const sameKey = (a: Line, productId: number, size_ml: number) =>
  a.product.id === productId && a.size_ml === size_ml;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (p, size_ml) =>
        set((s) => {
          const ex = s.lines.find((l) => sameKey(l, p.id, size_ml));
          return {
            open: true,
            lines: ex
              ? s.lines.map((l) =>
                  sameKey(l, p.id, size_ml) ? { ...l, qty: l.qty + 1 } : l
                )
              : [...s.lines, { product: p, qty: 1, size_ml }],
          };
        }),
      remove: (productId, size_ml) =>
        set((s) => ({
          lines: s.lines.filter((l) => !sameKey(l, productId, size_ml)),
        })),
      setQty: (productId, size_ml, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => !sameKey(l, productId, size_ml))
              : s.lines.map((l) =>
                  sameKey(l, productId, size_ml) ? { ...l, qty } : l
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
