"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "motion/react";
import { Webhook, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HookLogo } from "@/components/hook-logo";
import { ScrollHint } from "@/components/landing/scroll-hint";
import { LandingThemeToggle } from "@/components/landing/theme-toggle";
import { LandingLocaleToggle } from "@/components/landing/locale-toggle";

export function LandingHero() {
  const t = useTranslations("landing");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient orbs — blurred, floating, GPU-only (transform animation) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="animated-gradient absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-[100px] opacity-30 animate-float-slow" />
        <div
          className="absolute top-1/4 -right-40 w-[560px] h-[560px] rounded-full blur-[100px] opacity-25 animate-float-slow"
          style={{
            background:
              "radial-gradient(circle, var(--accent-secondary), transparent 65%)",
            animationDelay: "-2.4s",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[420px] h-[420px] rounded-full blur-[100px] opacity-20 animate-float-slow"
          style={{
            background:
              "radial-gradient(circle, var(--accent-tertiary), transparent 65%)",
            animationDelay: "-4.8s",
          }}
        />
      </div>

      {/* Background grid lines — radial mask fade so it dissolves at edges */}
      <div
        className="absolute inset-0 opacity-[0.05] mask-[radial-gradient(ellipse_75%_65%_at_50%_40%,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Floating webhook cards — subtle, hidden on mobile */}
      <div
        className="absolute inset-0 pointer-events-none hidden lg:block"
        aria-hidden="true"
      >
        {/* Webhook URL chip */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="absolute left-[6%] top-[24%]"
        >
          <div className="animate-float-slow -rotate-6">
            <div className="glass px-4 py-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="status-dot pulsing bg-success" />
                <span className="font-bold text-fg">POST</span>
                <span className="text-fg-tertiary">/hooks/discord</span>
              </div>
              <div className="mt-1.5 text-fg-tertiary">200 OK · 84ms</div>
            </div>
          </div>
        </motion.div>

        {/* Discord message preview */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.15, duration: 0.6 }}
          className="absolute right-[5%] top-[20%]"
        >
          <div
            className="animate-float-slow rotate-3"
            style={{ animationDelay: "-2.5s" }}
          >
            <div className="glass p-4 w-60 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent glow-primary flex items-center justify-center shrink-0">
                  <Webhook size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-tight">My Kait</div>
                  <div className="text-[11px] text-fg-tertiary font-mono">
                    BOT · now
                  </div>
                </div>
              </div>
              <p className="mt-2.5 text-sm text-fg-secondary">
                Order #1024 received
              </p>
              <div className="mt-2 rounded-lg bg-sunken border-l-2 border-accent px-3 py-2 font-mono text-[11px] text-fg-tertiary">
                {"embeds: [{...}]"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Terminal send chip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="absolute left-[9%] bottom-[22%]"
        >
          <div
            className="animate-float-slow rotate-2"
            style={{ animationDelay: "-5s" }}
          >
            <div className="terminal px-4 py-2.5 font-mono text-[11px] flex items-center gap-2">
              <Zap size={13} className="text-accent-2 shrink-0" />
              <span className="text-fg-secondary">
                kait send --template promo
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Theme toggle */}
      <LandingThemeToggle />
      <LandingLocaleToggle />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo — drop in from top with bounce, soft blurple glow */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
          className="inline-block mb-8"
        >
          <div className="drop-shadow-[0_0_36px_rgba(88,101,242,0.5)]">
            <HookLogo size={80} />
          </div>
        </motion.div>

        {/* Tagline badge above title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span className="glass inline-block rounded-full px-4 py-1.5 font-bold text-xs uppercase tracking-[0.1em] font-mono text-fg-secondary">
            {t("footerRights")}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9] uppercase gradient-text"
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
          <Link href="/api/auth/signin?callbackUrl=/id/dashboard">
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
