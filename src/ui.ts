import { create } from "zustand";

type UIStore = {
  commandOpen: boolean;
  mobileMenuOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  setMobileMenuOpen: (v: boolean) => void;
};

export const useUI = create<UIStore>((set) => ({
  commandOpen: false,
  mobileMenuOpen: false,
  setCommandOpen: (v) => set({ commandOpen: v }),
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
}));
