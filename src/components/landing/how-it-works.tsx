"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { LogIn, Link2, Pencil, Send } from "lucide-react";

const steps = [
  { num: "01", key: "step1", icon: LogIn, color: "accent" },
  { num: "02", key: "step2", icon: Link2, color: "accent-2" },
  { num: "03", key: "step3", icon: Pencil, color: "accent-3" },
  { num: "04", key: "step4", icon: Send, color: "accent-sky" },
] as const;

const iconBg: Record<string, string> = {
  accent: "bg-[linear-gradient(135deg,var(--accent-primary),var(--accent-primary-deep))]",
  "accent-2": "bg-[linear-gradient(135deg,var(--accent-secondary),var(--accent-secondary-deep))]",
  "accent-3": "bg-[linear-gradient(135deg,var(--accent-tertiary),var(--accent-tertiary-deep))]",
  "accent-sky": "bg-[linear-gradient(135deg,var(--accent-sky),var(--accent-sky-deep))]",
};

/**
 * How It Works — 4 step guide with cozy numbered cards.
 * Scroll-triggered stagger animation.
 */
export function HowItWorks() {
  const t = useTranslations("landing");

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3">
            {t("howTitle")}
          </h2>
          <p className="text-lg text-fg-secondary">
            {t("howSubtitle")}
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
            >
              <div className="cozy-card lift h-full p-6">
                {/* Number + Icon row */}
                <div className="flex items-start justify-between mb-5">
                  <span className="font-display font-black text-5xl leading-none gradient-text">
                    {step.num}
                  </span>
                  <div className={`rounded-2xl ${iconBg[step.color]} p-2.5 shadow-md`}>
                    <step.icon size={22} className="text-[#fffdf9]" />
                  </div>
                </div>
                {/* Text */}
                <h3 className="text-lg mb-2 leading-snug">
                  {t(`steps.${step.key}.title`)}
                </h3>
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {t(`steps.${step.key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
