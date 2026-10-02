import { setRequestLocale } from "next-intl/server";
import { getTemplates } from "@/server/actions/templates";
import { getFolders } from "@/server/actions/folders";
import { TemplatesList } from "@/components/templates/templates-list";

export default async function TemplatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; tag?: string; folder?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { search, tag, folder } = await searchParams;
  const [templates, folders] = await Promise.all([
    getTemplates(search, tag, folder),
    getFolders(),
  ]);

  return (
    <div className="animate-fade-in">
      <TemplatesList
        templates={templates}
        folders={folders}
        activeFolder={folder ?? "all"}
      />
    </div>
  );
}
