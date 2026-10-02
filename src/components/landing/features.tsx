"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-[3px] border-border-ink">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border-r-[3px] border-border-ink last:border-r-0 lg:border-b-0 border-b-[3px] lg:last:border-b-0"
            >
              <Card className="h-full border-0 hover:bg-surface-hover">
                <div className="p-6">
                  <div className="mb-4">
                    <f.icon size={40} className="text-fg" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-display text-xl mb-2 uppercase">
                    {t(`${f.key}.title`)}
                  </h3>
                  <p className="text-sm text-fg-secondary">
                    {t(`${f.key}.desc`)}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
