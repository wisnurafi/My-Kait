import { setRequestLocale } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getWebhooks, getHealthAlerts } from "@/server/actions/webhooks";
import { getWebhookFolders } from "@/server/actions/folders";
import { WebhooksList } from "@/components/webhooks/webhooks-list";
import { AddWebhookForm } from "@/components/webhooks/add-webhook-form";
import { HealthAlerts } from "@/components/webhooks/health-alerts";
import { cn } from "@/lib/utils";

export default async function WebhooksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; folder?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { search, folder } = await searchParams;
  const activeFolder = folder ?? "all";

  const [webhooks, healthAlerts, folderData] = await Promise.all([
    getWebhooks(
      search,
      activeFolder === "all" ? undefined : activeFolder === "unfiled" ? null : activeFolder,
    ),
    getHealthAlerts(),
    getWebhookFolders(),
  ]);
  const t = await getTranslations("webhooks");

  function folderHref(f: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (f !== "all") params.set("folder", f);
    const qs = params.toString();
    return `/${locale}/webhooks${qs ? `?${qs}` : ""}`;
  }

  function chip(f: string, label: string, count: number) {
    const isActive = activeFolder === f;
    return (
      <Link
        key={f}
        href={folderHref(f)}
        className={cn(
          "font-mono text-xs uppercase tracking-[0.08em] px-3 py-1.5 rounded-full border transition-colors",
          isActive
            ? "bg-accent text-ink border-accent font-bold"
            : "border-border-ink text-fg-secondary hover:text-fg hover:border-border-strong",
        )}
        aria-current={isActive ? "true" : undefined}
      >
        {label} <span className="opacity-60">{count}</span>
      </Link>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap stagger-in">
        <div>
          <div className="label mb-2">{t("title")}</div>
          <h2 className="uppercase">{t("title")}</h2>
        </div>
      </div>
      <HealthAlerts initialAlerts={healthAlerts} />
      <AddWebhookForm />
      {(folderData.folders.length > 0 || folderData.unfiledCount > 0) && (
        <div className="flex items-center gap-2 flex-wrap stagger-in" role="group" aria-label={t("folderFilter")}>
          {chip("all", t("foldersAll"), folderData.totalCount)}
          {chip("unfiled", t("foldersUnfiled"), folderData.unfiledCount)}
          {folderData.folders.map((f) => chip(f.id, f.name, f.webhookCount))}
        </div>
      )}
      <WebhooksList webhooks={webhooks} folders={folderData.folders} />
    </div>
  );
}
