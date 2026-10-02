"use client";

import { useTranslations } from "next-intl";
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
    <section id="features" className="border-t border-border-ink px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="label mb-3" style={{ color: "var(--accent-primary)" }}>
            system capabilities
          </div>
          <h2 className="mb-3 font-display text-4xl font-bold tracking-tight text-fg">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-xl text-fg-secondary">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.key} className="panel lift h-full p-6">
              <div className="mb-5 inline-flex rounded-lg border border-border-ink bg-sunken p-3">
                <f.icon size={24} className="text-accent" strokeWidth={2} />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-fg">
                {t(`${f.key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-fg-secondary">
                {t(`${f.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
