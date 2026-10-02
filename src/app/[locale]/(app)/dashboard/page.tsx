import { setRequestLocale, getTranslations } from "next-intl/server";
import { getWebhooks } from "@/server/actions/webhooks";
import { getLogs } from "@/server/actions/messages";
import { getDashboardStats } from "@/server/actions/stats";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Mascot } from "@/components/mascot";
import { DashboardStats, StatCards } from "@/components/dashboard/dashboard-stats";
import { Plus, Command } from "lucide-react";

const statusVariants = {
  sent: "success",
  failed: "danger",
  rate_limited: "warning",
  edited: "info",
  deleted: "default",
} as const;

const statusDot: Record<string, string> = {
  sent: "bg-success",
  failed: "bg-error",
  rate_limited: "bg-warning",
  edited: "bg-info",
  deleted: "bg-fg-tertiary",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const webhooks = await getWebhooks();
  const logsData = await getLogs({ perPage: 5 });
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page head */}
      <div className="flex items-start justify-between gap-4 flex-wrap stagger-in">
        <div className="flex items-center gap-4">
          <Mascot mini size={52} />
          <div>
            <div className="label mb-2">{t("overview")}</div>
            <h2>{t("missionControl")}</h2>
            <p className="text-fg-secondary mt-1 text-sm">{t("welcome")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Tooltip content={t("soon")}>
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border-ink bg-surface text-fg-tertiary font-mono text-[11px] cursor-default">
              <Command size={14} />
              ⌘K
              <span className="hidden sm:inline">{t("commandPalette")}</span>
            </span>
          </Tooltip>
          <Link href="/editor">
            <Button className="gap-2">
              <Plus size={16} />
              {t("createMessage")}
            </Button>
          </Link>
        </div>
      </div>

      <StatCards
        webhooks={webhooks.length}
        sent={logsData.summary.sent}
        successRate={logsData.summary.successRate}
      />

      <div>
        <h2
          className="text-xl mb-4 stagger-in"
          style={{ "--stagger-index": 2 } as React.CSSProperties}
        >
          {t("stats.title")}
        </h2>
        <DashboardStats
          daily={stats.daily}
          webhooks={stats.webhooks}
          successRate={stats.totals.successRate}
          sent={stats.totals.sent}
          failed={stats.totals.failed}
        />
      </div>

      {/* Recent activity — table */}
      <div>
        <div
          className="panel overflow-hidden stagger-in"
          style={{ "--stagger-index": 6 } as React.CSSProperties}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-ink">
            <span className="font-display font-semibold text-[15px]">
              {t("recentActivity")}
            </span>
            <Link
              href="/logs"
              className="font-mono text-xs text-accent no-underline hover:text-accent-deep"
            >
              {t("viewAll")} →
            </Link>
          </div>
          {logsData.logs.length === 0 ? (
            <div className="p-8 text-center text-fg-secondary text-sm">
              {t("noActivity")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-ink">
                    <th className="label text-left font-medium px-5 py-3">Status</th>
                    <th className="label text-left font-medium px-4 py-3">Target</th>
                    <th className="label text-left font-medium px-4 py-3">Mode</th>
                    <th className="label text-left font-medium px-4 py-3">Latency</th>
                    <th className="label text-right font-medium px-5 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logsData.logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border-ink last:border-0 transition-colors hover:bg-surface-hover"
                    >
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`status-dot ${statusDot[log.status] ?? "bg-fg-tertiary"}`}
                          />
                          <Badge variant={statusVariants[log.status] ?? "default"}>
                            {log.status.replace(/_/g, " ")}
                          </Badge>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium truncate max-w-[220px]">
                        {log.webhookNameSnapshot}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-fg-secondary">
                        {log.mode}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-fg-secondary">
                        {log.latencyMs != null ? `${log.latencyMs}ms` : "—"}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-fg-tertiary text-right whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
