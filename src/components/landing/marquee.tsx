"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";

/**
 * RawBlock Marquee — infinite scrolling banner.
 * Inverted strip with display font, soft gradient edge fades.
 */
export function Marquee() {
  const t = useTranslations("landing");
  const items = t("marquee").split(",");

  // Duplicate items for seamless loop
  const doubled = [...items, ...items, ...items, ...items];

  return (
    <div className="relative bg-fg text-bg border-y-[5px] border-border-ink overflow-hidden">
      <div className="py-4">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="font-display text-2xl md:text-3xl uppercase flex items-center gap-8"
            >
              {item}
              <span className="inline-block w-3 h-3 bg-bg" />
            </span>
          ))}
        </motion.div>
      </div>
      {/* Gradient edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--fg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--fg)] to-transparent" />
    </div>
  );
}
