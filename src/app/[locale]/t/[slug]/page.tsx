import { setRequestLocale } from "next-intl/server";
import { getSharedTemplateBySlug } from "@/server/actions/templates";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscordPreview } from "@/components/editor/discord-preview";
import Link from "next/link";
import { Copy } from "lucide-react";
import { auth } from "@/lib/auth";
import { importTemplateAction } from "@/server/actions/templates";

export default async function SharedTemplatePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const shared = await getSharedTemplateBySlug(slug);
  if (!shared) notFound();

  const session = await auth();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl uppercase">{shared.name}</h1>
            {shared.description && (
              <p className="text-fg-secondary mt-1">{shared.description}</p>
            )}
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">My Kait</Button>
          </Link>
        </div>

        {/* Tags */}
        {shared.tags && shared.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {shared.tags.map((tag: string) => (
              <Badge key={tag} variant="default">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Preview */}
        <Card className="p-5">
          <h2 className="font-display uppercase text-sm mb-3">Preview</h2>
          <DiscordPreview payload={shared.payload as Record<string, unknown>} username="My Kait" />
        </Card>

        {/* Import */}
        <Card className="p-5">
          {session?.user ? (
            <div>
              <p className="text-sm text-fg-secondary mb-3">
                Impor template ini ke koleksi kamu untuk digunakan dan diedit.
              </p>
              <form action={async (formData) => {
                "use server";
                formData.set("shareId", shared.shareId);
                await importTemplateAction(formData);
              }}>
                <input type="hidden" name="shareId" value={shared.shareId} />
                <Button type="submit" className="gap-2">
                  <Copy size={18} /> Pakai template ini
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-fg-secondary mb-4">
                Login dengan Discord untuk mengimpor template ini.
              </p>
              <Link href="/api/auth/signin?callbackUrl=/t/[slug]">
                <Button className="gap-2">Login dengan Discord</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Import count + Report */}
        <div className="flex items-center justify-center gap-4 text-xs text-fg-tertiary">
          <span>Diimpor {shared.importCount} kali</span>
          <span>·</span>
          <a href={`mailto:abuse@mykait.app?subject=Laporan Template&body=Slug: ${slug}`} className="text-error hover:underline">
            Laporkan
          </a>
        </div>
      </div>
    </div>
  );
}
