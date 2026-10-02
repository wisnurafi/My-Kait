"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Languages } from "lucide-react";

/**
 * In-nav locale toggle for the landing page.
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
      className="flex h-9 items-center gap-1.5 rounded-lg border border-border-ink px-3 font-mono text-xs font-bold uppercase text-fg-secondary transition-colors hover:border-border-strong hover:text-fg"
    >
      <Languages size={15} />
      {locale.toUpperCase()}
    </button>
  );
}
