"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Pencil, ShieldCheck, FileText, History } from "lucide-react";

const features = [
  { icon: Pencil, key: "editor", color: "accent" },
  { icon: ShieldCheck, key: "webhook", color: "accent-2" },
  { icon: FileText, key: "template", color: "accent-3" },
  { icon: History, key: "logs", color: "accent-sky" },
] as const;

const iconBg: Record<string, string> = {
  accent: "bg-[linear-gradient(135deg,var(--accent-primary),var(--accent-primary-deep))]",
  "accent-2": "bg-[linear-gradient(135deg,var(--accent-secondary),var(--accent-secondary-deep))]",
  "accent-3": "bg-[linear-gradient(135deg,var(--accent-tertiary),var(--accent-tertiary-deep))]",
  "accent-sky": "bg-[linear-gradient(135deg,var(--accent-sky),var(--accent-sky-deep))]",
};

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="mb-3">{t("title")}</h2>
          <p className="text-fg-secondary max-w-xl mx-auto">{t("subtitle")}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
            >
              <div className="cozy-card lift h-full p-6">
                <div className={`mb-5 inline-flex rounded-2xl ${iconBg[f.color]} p-3 shadow-md`}>
                  <f.icon size={26} className="text-[#fffdf9]" strokeWidth={2.25} />
                </div>
                <h3 className="text-lg mb-2">
                  {t(`${f.key}.title`)}
                </h3>
                <p className="text-sm text-fg-secondary leading-relaxed">
                  {t(`${f.key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
