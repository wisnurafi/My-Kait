import { setRequestLocale } from "next-intl/server";
import { getLogs } from "@/server/actions/messages";
import { getWebhooks } from "@/server/actions/webhooks";
import { LogsView } from "@/components/logs/logs-view";

export default async function LogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const filters = await searchParams;
  const logsData = await getLogs({
    status: filters.status,
    webhookId: filters.webhookId,
    mode: filters.mode,
    source: filters.source,
    search: filters.search,
    datePreset: filters.datePreset ?? "30d",
    sort: filters.sort ?? "newest",
    page: filters.page ? parseInt(filters.page) : 1,
  });
  const webhooks = await getWebhooks();

  return <LogsView logsData={logsData as any} webhooks={webhooks} currentFilters={filters} />;
}
