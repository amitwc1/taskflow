import { create } from "zustand";

interface ThemeState {
  dark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  dark: false,
  toggle: () =>
    set((s) => {
      const next = !s.dark;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", next ? "dark" : "light");
        document.documentElement.classList.toggle("dark", next);
      }
      return { dark: next };
    }),
  setDark: (v) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", v ? "dark" : "light");
      document.documentElement.classList.toggle("dark", v);
    }
    set({ dark: v });
  },
}));
