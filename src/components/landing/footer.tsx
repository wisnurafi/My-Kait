"use client";

import { useTranslations } from "next-intl";
import { HookLogo } from "@/components/hook-logo";

/**
 * Footer — bordered, structural, with a soft gradient accent line.
 */
export function Footer() {
  const t = useTranslations("landing");

  return (
    <footer className="relative border-t-[5px] border-border-ink">
      <div className="animated-gradient absolute top-0 inset-x-0 h-[3px] opacity-60" />
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Logo + tagline */}
            <div className="flex items-center gap-3">
              <div className="drop-shadow-[0_0_18px_rgba(122,158,126,0.4)]">
                <HookLogo size={32} />
              </div>
              <div>
                <div className="font-display text-lg uppercase gradient-text">
                  My Kait
                </div>
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
      </div>
    </footer>
  );
}
