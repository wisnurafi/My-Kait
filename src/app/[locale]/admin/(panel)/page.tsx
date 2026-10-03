import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/mascot";
import { getAdminOverview, getReports } from "@/server/actions/admin";
import { Flag, ArrowRight } from "lucide-react";

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="panel p-5">
      <p className="font-display font-bold text-3xl text-fg tabular-nums">
        {value.toLocaleString()}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-secondary mt-1.5">
        {label}
      </p>
    </div>
  );
}

function fmtDate(d: Date, locale: string) {
  return new Date(d).toLocaleString(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const stats = await getAdminOverview();
  const latest = (await getReports("pending")).slice(0, 5);
  const healthy =
    stats.webhooksDown === 0 &&
    stats.failedChecks24h === 0 &&
    stats.failedMessages24h === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap stagger-in">
        <div className="flex items-center gap-4">
          <Mascot mini size={52} />
          <div>
            <div className="label mb-2">{t("eyebrow")}</div>
            <h2>{t("overviewTitle")}</h2>
            <p className="text-sm text-fg-secondary mt-1">
              {t("overviewSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 stagger-in">
        <StatCard value={stats.users} label={t("statUsers")} />
        <StatCard value={stats.templates} label={t("statTemplates")} />
        <StatCard value={stats.activeShares} label={t("statActiveShares")} />
        <StatCard value={stats.messages7d} label={t("statMessages7d")} />
        <StatCard value={stats.pendingReports} label={t("statPendingReports")} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Moderation */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2">
              <Flag size={16} className="text-warning" />
              {t("latestReports")}
            </h3>
            <Link
              href="/admin/reports"
              className="text-xs text-accent hover:underline inline-flex items-center gap-1 no-underline"
            >
              {t("viewQueue")} <ArrowRight size={12} />
            </Link>
          </div>
          {latest.length === 0 ? (
            <p className="text-sm text-fg-secondary">{t("noPending")}</p>
          ) : (
            <ul className="space-y-3">
              {latest.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-3 text-sm border-t border-border-ink pt-3 first:border-0 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.templateName}</p>
                    <p className="text-xs text-fg-secondary line-clamp-1">
                      {r.reason}
                    </p>
                  </div>
                  <span className="text-xs text-fg-tertiary whitespace-nowrap font-mono">
                    {fmtDate(r.createdAt, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Health */}
        <div className="panel p-5">
          <h3 className="mb-4">{t("healthTitle")}</h3>
          {healthy ? (
            <p className="text-sm text-success flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-success" />
              {t("allClear")}
            </p>
          ) : (
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-t border-border-ink pt-3 first:border-0 first:pt-0">
                <dt className="text-fg-secondary">{t("webhooksDown")}</dt>
                <dd>
                  <Badge variant={stats.webhooksDown > 0 ? "danger" : "success"}>
                    {stats.webhooksDown}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-border-ink pt-3">
                <dt className="text-fg-secondary">{t("failedChecks24h")}</dt>
                <dd>
                  <Badge variant={stats.failedChecks24h > 0 ? "warning" : "success"}>
                    {stats.failedChecks24h}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-border-ink pt-3">
                <dt className="text-fg-secondary">{t("failedMessages24h")}</dt>
                <dd>
                  <Badge variant={stats.failedMessages24h > 0 ? "warning" : "success"}>
                    {stats.failedMessages24h}
                  </Badge>
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
