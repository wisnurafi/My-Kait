"use client";

/**
 * Admin login form. Submits via adminLoginAction; on success navigates
 * to the dashboard (the session cookie is set by the action).
 */

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HookLogo } from "@/components/hook-logo";
import {
  adminLoginAction,
  type AdminLoginState,
} from "@/server/actions/admin-auth";

export function AdminLoginForm() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AdminLoginState, FormData>(
    adminLoginAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      router.push("/admin");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="panel p-8 w-full max-w-sm animate-fade-in">
      <div className="flex items-center gap-2.5 mb-6">
        <HookLogo size={36} />
        <div>
          <p className="font-display font-bold text-lg leading-none">my-kait</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-error mt-1">
            {t("title")}
          </p>
        </div>
      </div>

      <h1 className="text-xl mb-1">{t("loginTitle")}</h1>
      <p className="text-sm text-fg-secondary mb-6">{t("loginSubtitle")}</p>

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="admin-email">{t("email")}</Label>
          <Input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="mt-1"
            disabled={pending}
          />
        </div>
        <div>
          <Label htmlFor="admin-password">{t("password")}</Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1"
            disabled={pending}
          />
        </div>
        {state.error && (
          <p className="text-xs text-error" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("loggingIn") : t("login")}
        </Button>
      </form>
    </div>
  );
}
