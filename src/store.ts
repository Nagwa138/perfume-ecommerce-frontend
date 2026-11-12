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
    { name: "nova-recent", partialize: (s) => ({ products: s.products }) }
  )
);

export type Line = {
  product: Product;
  qty: number;
  size?: string;
  colorName?: string;
  colorHex?: string;
};

type CartState = {
  lines: Line[];
  open: boolean;
  add: (p: Product, size?: string, colorName?: string, colorHex?: string) => void;
  remove: (productId: number, size?: string, colorHex?: string) => void;
  setQty: (productId: number, qty: number, size?: string, colorHex?: string) => void;
  toggle: () => void;
  clear: () => void;
};

const sameKey = (a: Line, productId: number, size?: string, colorHex?: string) =>
  a.product.id === productId && a.size === size && a.colorHex === colorHex;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (p, size, colorName, colorHex) =>
        set((s) => {
          const ex = s.lines.find((l) => sameKey(l, p.id, size, colorHex));
          return {
            open: true,
            lines: ex
              ? s.lines.map((l) =>
                  sameKey(l, p.id, size, colorHex) ? { ...l, qty: l.qty + 1 } : l
                )
              : [...s.lines, { product: p, qty: 1, size, colorName, colorHex }],
          };
        }),
      remove: (productId, size, colorHex) =>
        set((s) => ({
          lines: s.lines.filter((l) => !sameKey(l, productId, size, colorHex)),
        })),
      setQty: (productId, qty, size, colorHex) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => !sameKey(l, productId, size, colorHex))
              : s.lines.map((l) =>
                  sameKey(l, productId, size, colorHex) ? { ...l, qty } : l
                ),
        })),
      toggle: () => set((s) => ({ open: !s.open })),
      clear: () => set({ lines: [], open: false }),
    }),
    { name: "nova-cart", partialize: (s) => ({ lines: s.lines }) }
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
    { name: "nova-wishlist" }
  )
);
