import { setRequestLocale } from "next-intl/server";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

/**
 * Admin login — NOT linked from anywhere in the public UI.
 * Reach it directly via /<locale>/admin/login (bookmark it).
 */
export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <AdminLoginForm />
    </div>
  );
}
