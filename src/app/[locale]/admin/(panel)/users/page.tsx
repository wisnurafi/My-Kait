import { setRequestLocale, getTranslations } from "next-intl/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAdminUsers } from "@/server/actions/admin";
import { Search } from "lucide-react";

function fmtDate(d: Date, locale: string) {
  return new Date(d).toLocaleString(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const list = await getAdminUsers(q);

  return (
    <div className="space-y-6">
      <div className="stagger-in">
        <div className="label mb-2">{t("eyebrow")}</div>
        <h2>{t("usersTitle")}</h2>
        <p className="text-sm text-fg-secondary mt-1">{t("usersSubtitle")}</p>
      </div>

      <form method="get" className="flex gap-2 max-w-md stagger-in">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary"
          />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder={t("searchUsersPlaceholder")}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          {t("search")}
        </Button>
      </form>

      <div className="panel overflow-hidden stagger-in">
        {list.length === 0 ? (
          <p className="p-6 text-sm text-fg-secondary">{t("emptyUsers")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-tertiary text-left">
                  <th className="px-4 py-3 font-medium">{t("colUser")}</th>
                  <th className="px-4 py-3 font-medium">{t("colJoined")}</th>
                  <th className="px-4 py-3 font-medium">{t("colTemplates")}</th>
                  <th className="px-4 py-3 font-medium">{t("colWebhooks")}</th>
                  <th className="px-4 py-3 font-medium">{t("colMessages")}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-border-ink hover:bg-surface-hover/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {u.globalName ?? u.username}
                      </div>
                      <div className="text-xs text-fg-tertiary font-mono">
                        @{u.username} · {u.discordId}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-fg-secondary whitespace-nowrap">
                      {fmtDate(u.createdAt, locale)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{u.templateCount}</td>
                    <td className="px-4 py-3 tabular-nums">{u.webhookCount}</td>
                    <td className="px-4 py-3 tabular-nums">{u.messageCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
