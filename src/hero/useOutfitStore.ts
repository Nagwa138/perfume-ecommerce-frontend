import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ClothingSlot = "top" | "bottom" | "outerwear" | "shoes" | "accessory";

export type ClothingItem = {
  type: string;
  color: string;
  label: string;
  category: string;
};

type OutfitState = {
  top: ClothingItem;
  bottom: ClothingItem;
  outerwear: ClothingItem | null;
  shoes: ClothingItem;
  accessory: ClothingItem | null;
  setSlot: (slot: ClothingSlot, item: ClothingItem | null) => void;
};

export const TOP_OPTIONS: ClothingItem[] = [
  { type: "tee",      color: "#f1f5f9", label: "White Tee",       category: "T-Shirts" },
  { type: "hoodie",   color: "#1f2937", label: "Dark Hoodie",     category: "Hoodies"  },
  { type: "crewneck", color: "#7c3aed", label: "Purple Crewneck", category: "Hoodies"  },
  { type: "tee",      color: "#000000", label: "Black Tee",       category: "T-Shirts" },
];

export const BOTTOM_OPTIONS: ClothingItem[] = [
  { type: "jeans",   color: "#1e3a5f", label: "Blue Jeans",    category: "Pants" },
  { type: "cargo",   color: "#3f4b3b", label: "Cargo Pants",   category: "Pants" },
  { type: "joggers", color: "#111827", label: "Black Joggers",  category: "Pants" },
  { type: "shorts",  color: "#d1d5db", label: "Grey Shorts",   category: "Pants" },
];

export const OUTER_OPTIONS: (ClothingItem | null)[] = [
  null,
  { type: "bomber",       color: "#111827", label: "Black Bomber",  category: "Jackets" },
  { type: "puffer",       color: "#1e40af", label: "Blue Puffer",   category: "Jackets" },
  { type: "denim_jacket", color: "#1d4ed8", label: "Denim Jacket",  category: "Jackets" },
];

export const SHOE_OPTIONS: ClothingItem[] = [
  { type: "sneakers", color: "#f1f5f9", label: "White Kicks",  category: "Sneakers" },
  { type: "boots",    color: "#1c1917", label: "Black Boots",  category: "Sneakers" },
  { type: "sneakers", color: "#c2410c", label: "Orange Kicks", category: "Sneakers" },
];

export const ACCESSORY_OPTIONS: (ClothingItem | null)[] = [
  null,
  { type: "cap",      color: "#111827", label: "Black Cap",     category: "Accessories" },
  { type: "beanie",   color: "#7c3aed", label: "Purple Beanie", category: "Accessories" },
  { type: "backpack", color: "#1f2937", label: "Backpack",       category: "Accessories" },
];

export const useOutfitStore = create<OutfitState>()(
  persist(
    (set) => ({
      top:       TOP_OPTIONS[0],
      bottom:    BOTTOM_OPTIONS[0],
      outerwear: null,
      shoes:     SHOE_OPTIONS[0],
      accessory: null,
      setSlot:   (slot, item) => set({ [slot]: item }),
    }),
    { name: "nova-outfit" }
  )
);
