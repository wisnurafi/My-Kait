"use client";

import { useTranslations } from "next-intl";
import { HookLogo } from "@/components/hook-logo";

/**
 * RawBlock Footer — bordered, structural, no fluff.
 */
export function Footer() {
  const t = useTranslations("landing");

  return (
    <footer className="border-t-[5px] border-border-ink py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <HookLogo size={32} />
            <div>
              <div className="font-display text-lg uppercase">My Kait</div>
              <div className="text-xs text-fg-secondary font-mono">
                {t("footerTagline")}
              </div>
            </div>
          </div>

          {/* Rights */}
          <div className="text-xs font-mono uppercase tracking-[0.05em] text-fg-secondary">
            {t("footerRights")}
          </div>
        </div>
      </div>
    </footer>
  );
}
