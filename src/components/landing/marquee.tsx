"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

/**
 * Cozy Marquee — infinite scrolling banner with warm gradient.
 * Soft, rounded, gentle motion.
 */
export function Marquee() {
  const t = useTranslations("landing");
  const items = t("marquee").split(",");

  // Duplicate items for seamless loop
  const doubled = [...items, ...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden bg-[linear-gradient(100deg,var(--accent-primary-soft),var(--accent-secondary-soft),var(--accent-tertiary-soft))] border-y border-border">
      <div className="py-4">
        <motion.div
          className="flex gap-10 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="font-display font-extrabold text-xl md:text-2xl text-fg flex items-center gap-10"
            >
              {item.trim()}
              <Sparkles size={18} className="text-accent-secondary-deep shrink-0" />
            </span>
          ))}
        </motion.div>
      </div>
      {/* Soft edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent" />
    </div>
  );
}
