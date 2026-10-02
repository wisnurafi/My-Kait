"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { HookLogo } from "@/components/hook-logo";
import { Mascot } from "@/components/mascot";
import { LandingLocaleToggle } from "@/components/landing/locale-toggle";

interface PublicStats {
  totalMessages: number;
  deliveryRate: number;
  medianLatencyMs: number | null;
}

function compact(n: number): string {
  if (n >= 1000) {
    const v = (n / 1000).toFixed(1).replace(/\.0$/, "");
    return `${v}K`;
  }
  return String(n);
}

/* ------------------------------------------------------------------ */
/* Hero background canvas — ambient drifting dots + lime mouse trail   */
/* ------------------------------------------------------------------ */
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hero = canvas.parentElement;
    if (!hero) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let mx = -9999;
    let my = -9999;
    let gx = -9999;
    let gy = -9999;
    let raf = 0;

    interface Dot {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      lime: boolean;
    }
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      decay: number;
      r: number;
    }
    const dots: Dot[] = [];
    const trail: Particle[] = [];

    const resize = () => {
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 42; i++) {
      dots.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00022,
        vy: (Math.random() - 0.5) * 0.00022,
        r: Math.random() * 1.6 + 0.5,
        lime: Math.random() < 0.18,
      });
    }

    const onMove = (e: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      for (let i = 0; i < 3; i++) {
        if (trail.length > 130) trail.shift();
        trail.push({
          x: nx + (Math.random() - 0.5) * 14,
          y: ny + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 - 0.25,
          life: 1,
          decay: 0.014 + Math.random() * 0.012,
          r: Math.random() * 2 + 0.8,
        });
      }
      mx = nx;
      my = ny;
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);

    const frame = () => {
      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = 1;
        if (d.x > 1) d.x = 0;
        if (d.y < 0) d.y = 1;
        if (d.y > 1) d.y = 0;
        const dx = d.x * w - mx;
        const dy = d.y * h - my;
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / 220);
        const a = (d.lime ? 0.16 : 0.07) + near * 0.25;
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.r + near * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = d.lime
          ? `rgba(163,230,53,${a.toFixed(3)})`
          : `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.fill();
      }

      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      if (mx > -9999) {
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 260);
        grad.addColorStop(0, "rgba(163,230,53,0.055)");
        grad.addColorStop(1, "rgba(163,230,53,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(gx - 260, gy - 260, 520, 520);
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          trail.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(163,230,53,${(p.life * 0.5).toFixed(3)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1]"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Composer demo — animated form fill: type message, type title, send   */
/* ------------------------------------------------------------------ */
type DemoPhase = "typing" | "sending" | "sent";

function ComposerDemo() {
  const t = useTranslations("landing");
  const msgRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLSpanElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const msgFieldRef = useRef<HTMLDivElement | null>(null);
  const titleFieldRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<DemoPhase>("typing");
  const [activeField, setActiveField] = useState<"msg" | "title" | null>("msg");

  const demoMsg = t("demoMessageText");
  const demoTitle = t("demoTitleText");

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    async function typeInto(
      el: HTMLSpanElement | null,
      field: HTMLDivElement | null,
      text: string,
      key: "msg" | "title",
    ) {
      if (!el || !field || !cursorRef.current) return;
      setActiveField(key);
      field.appendChild(cursorRef.current);
      cursorRef.current.style.display = "";
      for (const ch of text) {
        if (cancelled) return;
        el.textContent += ch;
        await wait(26 + Math.random() * 34);
      }
      setActiveField(null);
    }

    async function loop() {
      if (reduced) {
        if (msgRef.current) msgRef.current.textContent = demoMsg;
        if (titleRef.current) titleRef.current.textContent = demoTitle;
        if (cursorRef.current) cursorRef.current.style.display = "none";
        setActiveField(null);
        setPhase("sent");
        return;
      }
      while (!cancelled) {
        if (msgRef.current) msgRef.current.textContent = "";
        if (titleRef.current) titleRef.current.textContent = "";
        setPhase("typing");
        await wait(800);
        if (cancelled) return;
        await typeInto(msgRef.current, msgFieldRef.current, demoMsg, "msg");
        if (cancelled) return;
        await wait(380);
        if (cancelled) return;
        await typeInto(
          titleRef.current,
          titleFieldRef.current,
          demoTitle,
          "title",
        );
        if (cancelled) return;
        await wait(550);
        if (cancelled) return;
        setPhase("sending");
        if (cursorRef.current) cursorRef.current.style.display = "none";
        await wait(1150);
        if (cancelled) return;
        setPhase("sent");
        await wait(3600);
        if (cancelled) return;
      }
    }

    const anchor = msgFieldRef.current;
    if (anchor && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            void loop();
            io.disconnect();
          }
        });
      });
      io.observe(anchor);
      return () => {
        cancelled = true;
        io.disconnect();
      };
    }
    void loop();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fieldClass = (key: "msg" | "title") =>
    `rounded-lg border bg-sunken px-3.5 py-3 text-[13.5px] leading-relaxed text-fg transition-colors duration-200 ${
      key === "msg" ? "min-h-[66px]" : "min-h-[22px]"
    } ${
      activeField === key
        ? "border-accent shadow-[0_0_0_3px_var(--accent-primary-soft)]"
        : "border-border-ink"
    }`;

  return (
    <div className="relative mx-auto mt-16 w-full max-w-[680px]">
      <div
        className="absolute -top-[58px] right-10 z-10 sm:right-14"
        style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))" }}
      >
        <Mascot size={92} />
      </div>
      <div className="panel p-[22px] text-left shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="mb-[18px] flex items-center justify-between border-b border-border-ink pb-3.5">
          <span className="label">{t("demoComposer")}</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-success/35 bg-success-soft px-2.5 py-1 font-mono text-[10.5px] tracking-[0.06em] text-success">
            <span
              className="status-dot"
              style={{ background: "var(--success)" }}
            />
            #announcements
          </span>
        </div>
        <div className="mb-4">
          <label className="label mb-2 block">{t("demoMessage")}</label>
          <div ref={msgFieldRef} className={fieldClass("msg")}>
            <span ref={msgRef} />
            <span ref={cursorRef} className="tcursor" />
          </div>
        </div>
        <div>
          <label className="label mb-2 block">{t("demoEmbedTitle")}</label>
          <div ref={titleFieldRef} className={fieldClass("title")}>
            <span ref={titleRef} />
          </div>
        </div>
        <div className="mt-[18px] flex items-center gap-3.5">
          <button
            type="button"
            tabIndex={-1}
            className={`inline-flex min-w-[118px] items-center justify-center gap-2 rounded-lg border px-5 py-2.5 font-mono text-[13px] font-semibold transition-colors duration-200 ${
              phase === "sent"
                ? "border-success bg-success text-[#0a0a0b]"
                : "border-accent bg-accent text-[#0a0a0b]"
            }`}
          >
            {phase === "sending" ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0a0a0b]/30 border-t-[#0a0a0b]" />
            ) : phase === "sent" ? (
              t("demoSent")
            ) : (
              t("demoSend")
            )}
          </button>
          <span
            className={`font-mono text-xs text-fg-secondary transition-opacity duration-300 ${
              phase === "sent" ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="font-semibold text-success">✓</span>{" "}
            {t("demoDelivered")} ·{" "}
            <span className="text-fg-tertiary">id 1293…8842</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stats strip — live platform numbers from /api/stats                  */
/* ------------------------------------------------------------------ */
function StatsStrip() {
  const t = useTranslations("landing");
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: PublicStats | null) => {
        if (alive && d) setStats(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const cells: { value: React.ReactNode; label: string; live?: boolean }[] = [
    {
      value: stats ? (
        compact(stats.totalMessages)
      ) : (
        <span className="shimmer mx-auto block h-7 w-24" />
      ),
      label: t("statsSent"),
      live: true,
    },
    {
      value: stats ? (
        `${stats.deliveryRate.toFixed(1)}%`
      ) : (
        <span className="shimmer mx-auto block h-7 w-20" />
      ),
      label: t("statsRate"),
    },
    {
      value: stats ? (
        stats.medianLatencyMs != null ? (
          <>
            {stats.medianLatencyMs}
            <span className="text-[15px] text-fg-tertiary">ms</span>
          </>
        ) : (
          "—"
        )
      ) : (
        <span className="shimmer mx-auto block h-7 w-20" />
      ),
      label: t("statsLatency"),
    },
  ];

  return (
    <div className="relative z-10 mt-16 border-t border-border-ink">
      <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-border-ink sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {cells.map((c) => (
          <div key={c.label} className="px-6 py-6 text-center">
            <div className="font-mono text-[26px] font-semibold tabular-nums text-fg">
              {c.live && stats && (
                <span
                  className="status-dot pulsing mr-2 inline-block align-middle"
                  style={{ background: "var(--accent-primary)" }}
                  title={t("live")}
                />
              )}
              {c.value}
            </div>
            <div className="label mt-1.5">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Landing hero                                                        */
/* ------------------------------------------------------------------ */
export function LandingHero() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const login = () =>
    signIn("discord", { callbackUrl: `/${locale}/dashboard` });

  return (
    <>
      {/* Minimal nav */}
      <header className="sticky top-0 z-40 border-b border-border-ink bg-bg">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <HookLogo size={30} />
            <span className="font-display text-[17px] font-bold tracking-wide text-fg">
              MY KAIT
            </span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-[13.5px] font-medium text-fg-secondary transition-colors hover:text-fg"
            >
              {t("navFeatures")}
            </a>
            <a
              href="#how"
              className="text-[13.5px] font-medium text-fg-secondary transition-colors hover:text-fg"
            >
              {t("navHow")}
            </a>
            <Link
              href="/templates"
              className="text-[13.5px] font-medium text-fg-secondary transition-colors hover:text-fg"
            >
              {t("navTemplates")}
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <LandingLocaleToggle />
            <button
              type="button"
              onClick={login}
              className="inline-flex items-center gap-2 rounded-lg border border-accent bg-accent px-4 py-2 font-mono text-[13px] font-semibold text-[#0a0a0b] transition-colors hover:brightness-110"
            >
              {t("loginDiscord")}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="dotgrid dotgrid-fade absolute inset-0"
          aria-hidden="true"
        />
        <HeroCanvas />
        <div className="relative z-[2] mx-auto max-w-6xl px-6 pt-[90px] text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-surface px-4 py-1.5 font-mono text-[11.5px] tracking-[0.08em] text-fg-secondary">
            <span
              className="status-dot pulsing"
              style={{ background: "var(--accent-primary)" }}
            />
            <span>
              v1.0.0 <span className="text-fg-tertiary">·</span>{" "}
              <span className="font-semibold text-accent">
                {t("versionNote")}
              </span>
            </span>
          </div>

          <h1 className="mx-auto mt-[22px] max-w-[860px] font-display text-5xl font-bold leading-[1.04] tracking-[-0.02em] text-fg md:text-[64px]">
            {t("heroTitleA")}
            <br />
            {t("heroTitleB1")}
            <span className="text-accent">{t("heroTitleB2")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[17px] text-fg-secondary">
            {t("heroSubtitle")}
          </p>
          <div className="mt-[34px] flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={login}
              className="inline-flex items-center gap-2 rounded-lg border border-accent bg-accent px-5 py-2.5 font-mono text-[13px] font-semibold text-[#0a0a0b] transition-colors hover:brightness-110"
            >
              {t("ctaStart")}
            </button>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-5 py-2.5 font-mono text-[13px] font-semibold text-fg transition-colors hover:border-fg-tertiary"
            >
              {t("ctaTemplates")}
            </Link>
          </div>

          <ComposerDemo />
        </div>
        <StatsStrip />
      </section>
    </>
  );
}
