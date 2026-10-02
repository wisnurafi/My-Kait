"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Pencil, ShieldCheck, FileText, History } from "lucide-react";

const features = [
  { icon: Pencil, key: "editor" },
  { icon: ShieldCheck, key: "webhook" },
  { icon: FileText, key: "template" },
  { icon: History, key: "logs" },
] as const;

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section className="py-24 px-6 border-t-[3px] border-border-ink">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="glass lift h-full p-6 hover:border-border-strong transition-colors">
                <div className="mb-5 inline-flex rounded-xl bg-gradient-to-br from-accent via-accent-2 to-accent-3 p-3 glow-primary">
                  <f.icon size={28} className="text-white" strokeWidth={2.25} />
                </div>
                <h3 className="font-display text-xl mb-2 uppercase">
                  {t(`${f.key}.title`)}
                </h3>
                <p className="text-sm text-fg-secondary">
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
