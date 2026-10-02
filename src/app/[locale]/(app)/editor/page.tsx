import { setRequestLocale } from "next-intl/server";
import { getWebhooks } from "@/server/actions/webhooks";
import { Editor } from "@/components/editor/editor";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const webhooks = await getWebhooks();

  return <Editor webhooks={webhooks} />;
}
