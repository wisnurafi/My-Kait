"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";

/**
 * RawBlock Marquee — infinite scrolling banner.
 * Black inverted strip with white text, big display font.
 */
export function Marquee() {
  const t = useTranslations("landing");
  const items = t("marquee").split(",");

  // Duplicate items for seamless loop
  const doubled = [...items, ...items, ...items, ...items];

  return (
    <div className="bg-fg text-bg border-y-[5px] border-border-ink overflow-hidden py-4">
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
          <span key={i} className="font-display text-2xl md:text-3xl uppercase flex items-center gap-8">
            {item}
            <span className="inline-block w-3 h-3 bg-bg" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
