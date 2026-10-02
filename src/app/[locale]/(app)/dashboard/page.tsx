import { setRequestLocale, getTranslations } from "next-intl/server";
import { getWebhooks } from "@/server/actions/webhooks";
import { getLogs } from "@/server/actions/messages";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Link2, History } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl uppercase">
          {t("greeting", { name: session?.user?.name || "User" })}
        </h1>
        <p className="text-fg-secondary mt-1">{t("welcome")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-3xl font-display">{webhooks.length}</div>
          <div className="text-sm text-fg-secondary">{t("webhooksCount")}</div>
        </Card>
        <Card className="p-5">
          <div className="text-3xl font-display">{logsData.summary.sent}</div>
          <div className="text-sm text-fg-secondary">{t("messagesSent")}</div>
        </Card>
        <Card className="p-5">
          <div className="text-3xl font-display">{logsData.summary.successRate}%</div>
          <div className="text-sm text-fg-secondary">{t("successRate")}</div>
        </Card>
      </div>

      <div className="flex gap-4 flex-wrap">
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
        <h2 className="font-display text-xl uppercase mb-4">{t("recentActivity")}</h2>
        <Card className="divide-y-[1px] divide-border-ink">
          {logsData.logs.length === 0 ? (
            <div className="p-8 text-center text-fg-secondary">
              {t("noActivity")}
            </div>
          ) : (
            logsData.logs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{log.webhookNameSnapshot}</div>
                  <div className="text-xs text-fg-secondary">
                    {log.mode} · {log.status}
                  </div>
                </div>
                <div className="text-xs text-fg-tertiary">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
