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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("mykait-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mykait-theme", theme);
  }, [theme, mounted]);

  function toggle() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  if (!mounted) {
    return <div className="fixed top-6 right-6 z-50 w-11 h-11" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
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
