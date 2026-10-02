"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HookLogo } from "@/components/hook-logo";
import { ScrollHint } from "@/components/landing/scroll-hint";
import { LandingThemeToggle } from "@/components/landing/theme-toggle";
import { LandingLocaleToggle } from "@/components/landing/locale-toggle";

export function LandingHero() {
  const t = useTranslations("landing");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background grid lines — subtle structural pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Theme toggle */}
      <LandingThemeToggle />
      <LandingLocaleToggle />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo — drop in from top with bounce */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
          className="inline-block mb-8"
        >
          <HookLogo size={80} />
        </motion.div>

        {/* Tagline badge above title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-6 border-[2px] border-border-ink px-4 py-1"
        >
          <span className="font-bold text-xs uppercase tracking-[0.1em] font-mono">
            {t("footerRights")}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9] uppercase"
        >
          {t("heroTitle")}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-lg md:text-xl text-fg-secondary max-w-2xl mx-auto"
        >
          {t("heroSubtitle")}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10"
        >
          <Link href="/api/auth/signin/discord?callbackUrl=/id/dashboard">
            <Button size="lg" className="text-lg gap-3">
              <DiscordIcon />
              {t("loginButton")}
            </Button>
          </Link>
        </motion.div>

        {/* Scroll hint */}
        <ScrollHint />
      </div>
    </section>
  );
}

function DiscordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127c-.598.349-1.22.644-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}
