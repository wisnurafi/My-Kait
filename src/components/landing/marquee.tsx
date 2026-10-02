"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";

/**
 * Marquee — mono ticker strip, lime diamond separators.
 * No gradients, no glow.
 */
export function Marquee() {
  const t = useTranslations("landing");
  const items = t("marquee").split(",");

  const doubled = [...items, ...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-border-ink bg-surface">
      <div className="py-4">
        <motion.div
          className="flex w-max items-center gap-10 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-10 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-fg-secondary"
            >
              {item.trim()}
              <span className="text-[10px] text-accent">◆</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
