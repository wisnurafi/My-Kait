"use client";

import { useTranslations } from "next-intl";
import { LogIn, Link2, Pencil, Send } from "lucide-react";

const steps = [
  { num: "01", key: "step1", icon: LogIn },
  { num: "02", key: "step2", icon: Link2 },
  { num: "03", key: "step3", icon: Pencil },
  { num: "04", key: "step4", icon: Send },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing");

  return (
    <section id="how" className="border-t border-border-ink px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="label mb-3" style={{ color: "var(--accent-primary)" }}>
            system boot sequence
          </div>
          <h2 className="mb-3 font-display text-4xl font-bold tracking-tight text-fg">
            {t("howTitle")}
          </h2>
          <p className="text-lg text-fg-secondary">{t("howSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.key} className="panel lift h-full p-6">
              <div className="mb-5 flex items-start justify-between">
                <span className="font-mono text-4xl font-semibold leading-none text-fg-tertiary">
                  {step.num}
                </span>
                <div className="rounded-lg border border-border-ink bg-sunken p-2.5">
                  <step.icon size={20} className="text-accent" />
                </div>
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold leading-snug text-fg">
                {t(`steps.${step.key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-fg-secondary">
                {t(`steps.${step.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
