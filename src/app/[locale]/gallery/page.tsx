import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { getGalleryTemplates } from "@/server/actions/templates";
import { Mascot } from "@/components/mascot";
import { HookLogo } from "@/components/hook-logo";
import { Badge } from "@/components/ui/badge";
import { DiscordLoginButton } from "@/components/auth/discord-login-button";
import { Download, ArrowUpRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicThemeManager } from "@/components/landing/theme-toggle";

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; sort?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");

  const { search, sort } = await searchParams;
  const activeSort = sort === "latest" ? "latest" : "popular";
  const templates = await getGalleryTemplates({ search, sort: activeSort });
  const session = await auth();

  const sortHref = (s: "popular" | "latest") => {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    sp.set("sort", s);
    return `?${sp.toString()}`;
  };

  return (
    <div className="min-h-screen">
      <PublicThemeManager />
      {/* minimal top bar */}
      <header className="border-b border-border-ink">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <HookLogo size={30} />
            <span className="font-display font-bold text-lg tracking-tight">
              MY KAIT
            </span>
          </Link>
          {session ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-fg-secondary hover:text-fg transition-colors"
            >
              {t("openApp")}
            </Link>
          ) : (
            <DiscordLoginButton callbackUrl={`/${locale}/dashboard`}>
              {t("loginDiscord")}
            </DiscordLoginButton>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-14">
        {/* heading */}
        <div className="flex items-start gap-5 mb-10">
          <Mascot mini size={64} />
          <div>
            <div className="label mb-2">{t("eyebrow")}</div>
            <h1 className="mb-2">{t("title")}</h1>
            <p className="text-fg-secondary max-w-xl">{t("subtitle")}</p>
          </div>
        </div>

        {/* search + sort */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <form method="GET" className="flex gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary"
              />
              <input
                type="text"
                name="search"
                defaultValue={search ?? ""}
                placeholder={t("searchPlaceholder")}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-input border border-border-ink text-sm text-fg placeholder:text-fg-tertiary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {activeSort !== "popular" && (
              <input type="hidden" name="sort" value={activeSort} />
            )}
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-accent text-[#0a0a0b] text-sm font-semibold hover:brightness-110 transition-all cursor-pointer"
            >
              {t("search")}
            </button>
          </form>
          <div className="flex rounded-lg border border-border-ink overflow-hidden">
            {(
              [
                { key: "popular", label: t("popular") },
                { key: "latest", label: t("latest") },
              ] as const
            ).map((s) => (
              <Link
                key={s.key}
                href={sortHref(s.key)}
                className={cn(
                  "px-4 h-10 inline-flex items-center text-sm font-semibold transition-colors",
                  activeSort === s.key
                    ? "bg-accent-soft text-accent"
                    : "text-fg-secondary hover:text-fg",
                )}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <Link
                key={tpl.slug}
                href={`/t/${tpl.slug}`}
                className="panel lift p-5 flex flex-col gap-3 no-underline group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[17px] leading-snug group-hover:text-accent transition-colors">
                    {tpl.name}
                  </h3>
                  <ArrowUpRight
                    size={16}
                    className="text-fg-tertiary group-hover:text-accent shrink-0 mt-1 transition-colors"
                  />
                </div>
                {tpl.description && (
                  <p className="text-sm text-fg-secondary line-clamp-2">
                    {tpl.description}
                  </p>
                )}
                {tpl.tags && tpl.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tpl.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-3 border-t border-border-ink flex items-center justify-between">
                  <span className="font-mono text-[11px] text-fg-tertiary">
                    @{tpl.author}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-fg-secondary">
                    <Download size={12} />
                    {tpl.importCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="panel p-12 flex flex-col items-center text-center gap-4">
            <Mascot size={84} />
            <div>
              <h3 className="mb-1">{t("emptyTitle")}</h3>
              <p className="text-sm text-fg-secondary">{t("emptyDesc")}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
