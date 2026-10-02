import { setRequestLocale, getTranslations } from "next-intl/server";
import { getWebhooks } from "@/server/actions/webhooks";
import { getLogs } from "@/server/actions/messages";
import { getDashboardStats } from "@/server/actions/stats";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardStats, StatCards } from "@/components/dashboard/dashboard-stats";
import { Pencil, Link2, History } from "lucide-react";

const statusVariants = {
  sent: "success",
  failed: "danger",
  rate_limited: "warning",
  edited: "info",
  deleted: "default",
} as const;

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const session = await auth();
  const webhooks = await getWebhooks();
  const logsData = await getLogs({ perPage: 5 });
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="stagger-in">
        <h1 className="font-display text-3xl uppercase">
          {t("greeting", { name: session?.user?.name || "User" })}
        </h1>
        <p className="text-fg-secondary mt-1">{t("welcome")}</p>
      </div>

      <StatCards
        webhooks={webhooks.length}
        sent={logsData.summary.sent}
        successRate={logsData.summary.successRate}
      />

      <div className="flex gap-3 flex-wrap stagger-in" style={{ "--stagger-index": 1 } as React.CSSProperties}>
        <Link href="/editor">
          <Button size="lg" className="gap-2">
            <Pencil size={20} />
            {t("createMessage")}
          </Button>
        </Link>
        <Link href="/webhooks">
          <Button variant="secondary" size="lg" className="gap-2">
            <Link2 size={20} />
            {t("manageWebhooks")}
          </Button>
        </Link>
        <Link href="/logs">
          <Button variant="secondary" size="lg" className="gap-2">
            <History size={20} />
            {t("viewLogs")}
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="font-display text-xl uppercase mb-4 stagger-in" style={{ "--stagger-index": 2 } as React.CSSProperties}>
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

      <div>
        <h2 className="font-display text-xl uppercase mb-4 stagger-in" style={{ "--stagger-index": 6 } as React.CSSProperties}>
          {t("recentActivity")}
        </h2>
        <div className="stagger-in" style={{ "--stagger-index": 7 } as React.CSSProperties}>
          <Card className="divide-y-[1px] divide-border-ink overflow-hidden">
            {logsData.logs.length === 0 ? (
              <div className="p-8 text-center text-fg-secondary">
                {t("noActivity")}
              </div>
            ) : (
              logsData.logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 flex items-center justify-between gap-3 transition-colors duration-200 hover:bg-white/[0.03]"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{log.webhookNameSnapshot}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-fg-secondary font-mono">{log.mode}</span>
                      <Badge variant={statusVariants[log.status] ?? "default"} dot>
                        {log.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-fg-tertiary font-mono shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
