import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BeatId } from "./types";

type BeautyPreferenceState = {
  lastVisitedCategory: BeatId | null;
  setLastVisitedCategory: (id: BeatId) => void;
};

export const useBeautyPreference = create<BeautyPreferenceState>()(
  persist(
    (set) => ({
      lastVisitedCategory: null,
      setLastVisitedCategory: (id) => set({ lastVisitedCategory: id }),
    }),
    { name: "hossam.beauty-preference.v1" }
  )
);
