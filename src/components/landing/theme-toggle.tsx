"use client";

/**
 * Landing theme toggle — independent from the app theme.
 *
 * The landing keeps its own preference (default dark) so the app's theme
 * never leaks into it (e.g. dashboard in light mode -> landing stays dark).
 * Applies on mount, restores the app theme on unmount.
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Sun, Moon } from "lucide-react";

const LANDING_STORAGE_KEY = "mykait-landing-theme";
const APP_STORAGE_KEY = "mykait-theme";

type LandingTheme = "dark" | "light";

function applyLandingTheme(theme: LandingTheme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    // :root carries the dark tokens — removing the attribute = dark
    root.removeAttribute("data-theme");
  }
}

function restoreAppTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem(APP_STORAGE_KEY);
  if (saved === "light") {
    root.setAttribute("data-theme", "light");
  } else if (saved === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
}

/** Applies the landing theme while mounted (no visible toggle). */
export function PublicThemeManager() {
  useEffect(() => {
    const saved = localStorage.getItem(
      LANDING_STORAGE_KEY,
    ) as LandingTheme | null;
    applyLandingTheme(saved === "light" ? "light" : "dark");
    return () => restoreAppTheme();
  }, []);
  return null;
}

export function LandingThemeToggle() {
  const t = useTranslations("landing");
  const [theme, setTheme] = useState<LandingTheme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem(
      LANDING_STORAGE_KEY,
    ) as LandingTheme | null;
    const initial: LandingTheme = saved === "light" ? "light" : "dark";
    setTheme(initial);
    applyLandingTheme(initial);
    return () => restoreAppTheme();
  }, []);

  const toggle = () => {
    const next: LandingTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(LANDING_STORAGE_KEY, next);
    applyLandingTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggleTheme")}
      title={t("toggleTheme")}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border-ink text-fg-secondary transition-colors hover:border-border-strong hover:text-fg"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
