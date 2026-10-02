"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "motion/react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldOff, Infinity as InfinityIcon, Gift } from "lucide-react";

/**
 * Free Forever banner — inverted block, big text, icon list.
 * RawBlock: black bg, white text, full inversion.
 */
export function FreeBanner() {
  const t = useTranslations("landing");

  const points = [
    { icon: ShieldOff, key: "noPaywall" },
    { icon: InfinityIcon, key: "noQuota" },
    { icon: Gift, key: "noCard" },
  ] as const;

  // Use inline text since these are short labels
  const labels: Record<string, { id: string; en: string }> = {
    noPaywall: { id: "Tanpa paywall", en: "No paywall" },
    noQuota: { id: "Tanpa batasan jumlah", en: "No quota limits" },
    noCard: { id: "Tanpa kartu kredit", en: "No credit card" },
  };

  const locale = useLocale();
  const lang = locale === "en" ? "en" : "id";

  return (
    <section className="border-t border-border">
      <div className="bg-[#2d2a26] dark:bg-[#faf7f2] py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            className="inline-block mb-6"
          >
            <Sparkles size={48} className="text-[#faf7f2] dark:text-[#1a1512]" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-display text-5xl md:text-7xl uppercase leading-none text-[#faf7f2] dark:text-[#1a1512]"
          >
            {t("freeTitle")}
            <br />
            {t("freeTitle2")}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 text-lg md:text-xl text-[#faf7f2] dark:text-[#1a1512] max-w-2xl mx-auto opacity-90"
          >
            {t("freeDesc")}
          </motion.p>

          {/* Points */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6"
          >
            {points.map((p) => (
              <div
                key={p.key}
                className="flex items-center gap-2 border-2 border-[#faf7f2] dark:border-[#1a1512] px-4 py-2 rounded-lg"
              >
                <p.icon size={18} className="text-[#faf7f2] dark:text-[#1a1512]" />
                <span className="font-bold uppercase tracking-[0.05em] text-sm text-[#faf7f2] dark:text-[#1a1512]">
                  {labels[p.key][lang]}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <Button size="lg" className="text-lg gap-3" onClick={() => signIn("discord", { callbackUrl: "/id/dashboard" })}>
              {t("freeCta")}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
