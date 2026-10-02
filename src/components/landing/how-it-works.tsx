"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { LogIn, Link2, Pencil, Send } from "lucide-react";

const steps = [
  { num: "01", key: "step1", icon: LogIn },
  { num: "02", key: "step2", icon: Link2 },
  { num: "03", key: "step3", icon: Pencil },
  { num: "04", key: "step4", icon: Send },
] as const;

/**
 * How It Works — 4 step guide with numbered glass cards and gradient-glow icons.
 */
export function HowItWorks() {
  const t = useTranslations("landing");

  return (
    <section className="py-24 px-6 border-t-[3px] border-border-ink">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-none">
            {t("howTitle")}
          </h2>
          <p className="mt-3 text-lg text-fg-secondary font-mono">
            {t("howSubtitle")}
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="glass lift h-full p-6 hover:border-border-strong transition-colors">
                {/* Number + Icon row */}
                <div className="flex items-start justify-between mb-5">
                  <span className="font-display text-5xl leading-none gradient-text">
                    {step.num}
                  </span>
                  <div className="rounded-xl bg-gradient-to-br from-accent via-accent-2 to-accent-3 p-2.5 glow-primary">
                    <step.icon size={24} className="text-white" />
                  </div>
                </div>
                {/* Text */}
                <h3 className="font-display text-lg uppercase mb-2 leading-tight">
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
