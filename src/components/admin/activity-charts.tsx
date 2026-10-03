"use client";

/**
 * Admin activity charts — same SVG visual language as the user
 * dashboard's DailyChart (solid devtool colors, no chart lib).
 */

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import type { AdminDaily } from "@/server/actions/admin";

const W = 600;
const H = 140;

function AxisLabels({ daily }: { daily: AdminDaily[] }) {
  return (
    <div className="flex justify-between text-[10px] font-mono text-fg-tertiary mt-1">
      <span>{daily[0]?.date.slice(5)}</span>
      <span>{daily[daily.length - 1]?.date.slice(5)}</span>
    </div>
  );
}

function MessagesChart({ daily }: { daily: AdminDaily[] }) {
  const t = useTranslations("admin");
  const max = Math.max(
    1,
    ...daily.map((d) => d.sent + d.failed),
  );
  const barW = W / daily.length;

  return (
    <Card className="p-5">
      <h3 className="text-lg mb-4">{t("chartMessages")}</h3>
      {daily.every((d) => d.sent + d.failed === 0) ? (
        <p className="text-sm text-fg-secondary py-8 text-center">
          {t("noData")}
        </p>
      ) : (
        <div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={t("chartMessages")}
          >
            {daily.map((d, i) => {
              const total = d.sent + d.failed;
              const h = Math.max(2, (total / max) * (H - 24));
              const sentH = (d.sent / Math.max(1, total)) * h;
              return (
                <g key={d.date}>
                  <title>{`${d.date}: ${t("sent")} ${d.sent}, ${t("failed")} ${d.failed}`}</title>
                  <rect
                    x={i * barW + 1}
                    y={H - 20 - h}
                    width={barW - 2}
                    height={h}
                    rx={2}
                    fill="var(--error)"
                    opacity={0.75}
                  />
                  <rect
                    x={i * barW + 1}
                    y={H - 20 - sentH}
                    width={barW - 2}
                    height={sentH}
                    rx={2}
                    fill="var(--accent-primary)"
                    opacity={0.9}
                  />
                </g>
              );
            })}
            <line
              x1={0}
              y1={H - 20}
              x2={W}
              y2={H - 20}
              stroke="var(--border)"
              strokeWidth={1}
            />
          </svg>
          <AxisLabels daily={daily} />
          <div className="flex gap-4 mt-3 text-xs text-fg-secondary">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-accent" />
              {t("sent")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-error" />
              {t("failed")}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

function UsersChart({ daily }: { daily: AdminDaily[] }) {
  const t = useTranslations("admin");
  const max = Math.max(1, ...daily.map((d) => d.users));
  const barW = W / daily.length;

  return (
    <Card className="p-5">
      <h3 className="text-lg mb-4">{t("chartUsers")}</h3>
      {daily.every((d) => d.users === 0) ? (
        <p className="text-sm text-fg-secondary py-8 text-center">
          {t("noData")}
        </p>
      ) : (
        <div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={t("chartUsers")}
          >
            {daily.map((d, i) => {
              const h = Math.max(2, (d.users / max) * (H - 24));
              return (
                <g key={d.date}>
                  <title>{`${d.date}: ${d.users}`}</title>
                  <rect
                    x={i * barW + 1}
                    y={H - 20 - h}
                    width={barW - 2}
                    height={h}
                    rx={2}
                    fill="var(--accent-sky)"
                    opacity={0.85}
                  />
                </g>
              );
            })}
            <line
              x1={0}
              y1={H - 20}
              x2={W}
              y2={H - 20}
              stroke="var(--border)"
              strokeWidth={1}
            />
          </svg>
          <AxisLabels daily={daily} />
        </div>
      )}
    </Card>
  );
}

export function AdminActivityCharts({ daily }: { daily: AdminDaily[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4 stagger-in">
      <MessagesChart daily={daily} />
      <UsersChart daily={daily} />
    </div>
  );
}
