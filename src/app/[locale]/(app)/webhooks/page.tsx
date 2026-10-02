import { setRequestLocale } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { getWebhooks, getHealthAlerts } from "@/server/actions/webhooks";
import { WebhooksList } from "@/components/webhooks/webhooks-list";
import { AddWebhookForm } from "@/components/webhooks/add-webhook-form";
import { HealthAlerts } from "@/components/webhooks/health-alerts";

export default async function WebhooksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { search } = await searchParams;
  const webhooks = await getWebhooks(search);
  const healthAlerts = await getHealthAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-3xl uppercase">Webhook</h1>
      </div>
      <HealthAlerts initialAlerts={healthAlerts} />
      <AddWebhookForm />
      <WebhooksList webhooks={webhooks} />
    </div>
  );
}
