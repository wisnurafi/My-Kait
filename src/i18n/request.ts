import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { Locale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate locale
  const requested = await requestLocale;
  const locale: Locale = routing.locales.includes(requested as Locale)
    ? (requested as Locale)
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
