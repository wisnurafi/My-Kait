import { setRequestLocale } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { getWebhooks } from "@/server/actions/webhooks";
import { WebhooksList } from "@/components/webhooks/webhooks-list";
import { AddWebhookForm } from "@/components/webhooks/add-webhook-form";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display text-3xl uppercase">Webhook</h1>
      </div>
      <AddWebhookForm />
      <WebhooksList webhooks={webhooks} />
    </div>
  );
}
