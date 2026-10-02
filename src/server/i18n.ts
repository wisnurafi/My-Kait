import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/routing";

/**
 * Translations for Server Actions.
 *
 * Server Actions don't have access to the request locale the way Server
 * Components do, so we read it from the NEXT_LOCALE cookie that the
 * next-intl middleware sets. Falls back to the default locale.
 *
 * Usage: `const t = await getActionT("errors"); return { error: t("webhookNotFound") };`
 */
export async function getActionT(namespace: string) {
  const store = await cookies();
  const raw = store.get("NEXT_LOCALE")?.value;
  const locale = raw === "en" ? "en" : defaultLocale;
  return getTranslations({ locale, namespace });
}
