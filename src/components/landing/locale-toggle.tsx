"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";

/**
 * Floating locale toggle for landing page.
 * Switches between id/en, preserving the current path.
 */
export function LandingLocaleToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function toggle() {
    const next = locale === "id" ? "en" : "id";
    router.replace(pathname, { locale: next });
  }

  return (
    <button
      onClick={toggle}
      aria-label="Ganti bahasa / Switch language"
      title={locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      className={cn(
        "fixed top-6 right-[5.5rem] z-50 h-11 px-3 flex items-center gap-1.5 cursor-pointer",
        "glass rounded-full lift",
        "font-mono font-bold text-sm uppercase text-fg",
        "focus-ring",
      )}
    >
      <Languages size={18} />
      {locale.toUpperCase()}
    </button>
  );
}
