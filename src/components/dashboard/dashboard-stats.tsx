"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import type { DailyStat, WebhookStat } from "@/server/actions/stats";

/* --- Messages per day: SVG stacked bar chart --- */
function DailyChart({ daily }: { daily: DailyStat[] }) {
  const t = useTranslations("dashboard");
  const max = Math.max(1, ...daily.map((d) => d.total));
  const W = 600;
  const H = 140;
  const barW = W / daily.length;

  return (
    <Card className="p-5">
      <h3 className="font-display text-lg uppercase mb-4">{t("stats.perDay")}</h3>
      {daily.every((d) => d.total === 0) ? (
        <p className="text-sm text-fg-secondary py-8 text-center">{t("stats.noData")}</p>
      ) : (
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("stats.perDay")}>
            {daily.map((d, i) => {
              const h = Math.max(2, (d.total / max) * (H - 24));
              const sentH = (d.sent / Math.max(1, d.total)) * h;
              return (
                <g key={d.date}>
                  <title>{`${d.date}: ${d.total}`}</title>
                  <rect
                    x={i * barW + 1}
                    y={H - 20 - h}
                    width={barW - 2}
                    height={h}
                    fill="var(--color-error, #dc2626)"
                    opacity={0.85}
                  />
                  <rect
                    x={i * barW + 1}
                    y={H - 20 - sentH}
                    width={barW - 2}
                    height={sentH}
                    fill="currentColor"
                  />
                </g>
              );
            })}
            <line x1={0} y1={H - 20} x2={W} y2={H - 20} stroke="currentColor" strokeWidth={2} />
          </svg>
          <div className="flex justify-between text-[10px] font-mono text-fg-tertiary mt-1">
            <span>{daily[0]?.date.slice(5)}</span>
            <span>{daily[daily.length - 1]?.date.slice(5)}</span>
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 bg-ink border border-border-ink" />
              {t("stats.sent")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 bg-error border border-border-ink" />
              {t("stats.failed")}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

/* --- Most active webhooks: horizontal bars --- */
function WebhookChart({ webhooks }: { webhooks: WebhookStat[] }) {
  const t = useTranslations("dashboard");
  const max = Math.max(1, ...webhooks.map((w) => w.total));

  return (
    <Card className="p-5">
      <h3 className="font-display text-lg uppercase mb-4">{t("stats.topWebhooks")}</h3>
      {webhooks.length === 0 ? (
        <p className="text-sm text-fg-secondary py-8 text-center">{t("stats.noData")}</p>
      ) : (
        <div className="space-y-3">
          {webhooks.map((w) => (
            <div key={w.webhookId ?? w.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold truncate max-w-[60%]">{w.name}</span>
                <span className="font-mono text-fg-secondary">
                  {w.total}
                  {w.failed > 0 && <span className="text-error"> · {w.failed} ✗</span>}
                </span>
              </div>
              <div className="h-5 bg-sunken border-2 border-border-ink">
                <div
                  className="h-full bg-ink"
                  style={{ width: `${(w.total / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* --- Success rate: donut --- */
function SuccessDonut({ rate, sent, failed }: { rate: number; sent: number; failed: number }) {
  const t = useTranslations("dashboard");
  const R = 54;
  const C = 2 * Math.PI * R;
  const offset = C - (rate / 100) * C;

  return (
    <Card className="p-5 flex flex-col items-center">
      <h3 className="font-display text-lg uppercase mb-4 self-start">{t("stats.successRate")}</h3>
      <div className="relative">
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={R} fill="none" strokeWidth={14}
            stroke="var(--color-sunken, #e5e5e5)" />
          <circle cx={70} cy={70} r={R} fill="none" strokeWidth={14}
            stroke="currentColor"
            strokeDasharray={C}
            strokeDashoffset={offset}
            strokeLinecap="square"
            transform="rotate(-90 70 70)" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-3xl">{rate}%</span>
        </div>
      </div>
      <div className="flex gap-4 mt-4 text-xs">
        <span className="font-mono">✓ {sent}</span>
        <span className="font-mono text-error">✗ {failed}</span>
      </div>
      <p className="text-[11px] text-fg-tertiary mt-2">{t("stats.last30days")}</p>
    </Card>
  );
}

export function DashboardStats({
  daily,
  webhooks,
  successRate,
  sent,
  failed,
}: {
  daily: DailyStat[];
  webhooks: WebhookStat[];
  successRate: number;
  sent: number;
  failed: number;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <DailyChart daily={daily} />
      </div>
      <SuccessDonut rate={successRate} sent={sent} failed={failed} />
      <div className="lg:col-span-3">
        <WebhookChart webhooks={webhooks} />
      </div>
    </div>
  );
}
