"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldOff, Infinity as InfinityIcon, Gift } from "lucide-react";

/**
 * Free Forever banner — inverted block, big text, icon list.
 * Inversion preserved via bg-inverted; gradient orbs + hairline accents.
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
    <section className="relative border-t-[5px] border-border-ink">
      <div className="relative bg-inverted text-bg overflow-hidden">
        {/* Gradient hairline across the top */}
        <div className="animated-gradient absolute top-0 inset-x-0 h-1" />

        {/* Gradient orbs — subtle color wash on the inverted surface */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute -top-24 left-[10%] w-[420px] h-[420px] rounded-full blur-[100px] opacity-20 animate-float-slow"
            style={{
              background:
                "radial-gradient(circle, var(--accent-primary), transparent 65%)",
            }}
          />
          <div
            className="absolute -bottom-32 right-[8%] w-[460px] h-[460px] rounded-full blur-[100px] opacity-15 animate-float-slow"
            style={{
              background:
                "radial-gradient(circle, var(--accent-tertiary), transparent 65%)",
              animationDelay: "-3.5s",
            }}
          />
        </div>

        <div className="relative py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-6"
            >
              <div className="rounded-full bg-gradient-to-br from-accent via-accent-2 to-accent-3 p-4 glow-primary">
                <Sparkles size={36} className="text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl md:text-7xl uppercase leading-none"
            >
              {t("freeTitle")}
              <br />
              {t("freeTitle2")}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-bg/70 max-w-2xl mx-auto"
            >
              {t("freeDesc")}
            </motion.p>

            {/* Points */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6"
            >
              {points.map((p) => (
                <div
                  key={p.key}
                  className="lift flex items-center gap-2 border-[2px] border-bg px-4 py-2"
                >
                  <p.icon size={18} className="text-bg" />
                  <span className="font-bold uppercase tracking-[0.05em] text-sm">
                    {labels[p.key][lang]}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <Link href="/api/auth/signin?callbackUrl=/id/dashboard">
                <Button size="lg" className="text-lg gap-3">
                  {t("freeCta")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
