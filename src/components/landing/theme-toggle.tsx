"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";

type Theme = "system" | "light" | "dark";

/**
 * Floating theme toggle for landing page.
 * Glass pill, cycling system → light → dark.
 */
export function LandingThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("mykait-theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    localStorage.setItem("mykait-theme", theme);
  }, [theme, mounted]);

  function cycle() {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  }

  if (!mounted) {
    return <div className="fixed top-6 right-6 z-50 w-11 h-11" />;
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={cycle}
      aria-label="Toggle theme"
      className={cn(
        "fixed top-6 right-6 z-50 w-11 h-11 flex items-center justify-center cursor-pointer",
        "glass rounded-full lift",
        "focus-ring",
      )}
    >
      {isDark ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
