"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const setDark = useThemeStore((s) => s.setDark);

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
  }, [setDark]);

  return <>{children}</>;
}
