import { setRequestLocale } from "next-intl/server";
import { getTemplates } from "@/server/actions/templates";
import { TemplatesList } from "@/components/templates/templates-list";

export default async function TemplatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; tag?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { search, tag } = await searchParams;
  const templates = await getTemplates(search, tag);

  return <TemplatesList templates={templates} />;
}
