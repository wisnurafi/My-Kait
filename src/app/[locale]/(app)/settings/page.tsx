import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  return <SettingsClient user={session?.user ?? null} />;
}
