"use client";

import { useTranslations } from "next-intl";
import { HookLogo } from "@/components/hook-logo";

/**
 * Footer — minimal, bordered, structural.
 */
export function Footer() {
  const t = useTranslations("landing");

  return (
    <footer className="border-t border-border-ink">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <HookLogo size={32} />
          <div>
            <div className="font-display text-lg font-bold tracking-wide text-fg">
              MY KAIT
            </div>
            <div className="font-mono text-xs text-fg-secondary">
              {t("footerTagline")}
            </div>
          </div>
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.08em] text-fg-tertiary">
          {t("footerRights")}
        </div>
      </div>
    </footer>
  );
}
