"use client";

/**
 * Generic two-step confirm button: click once → turns into
 * "yakin?" confirm/cancel → click again executes the action.
 */

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

export function ConfirmButton({
  action,
  variant = "secondary",
  confirmVariant = "destructive",
  label,
  confirmLabel,
  confirmHint,
  icon,
}: {
  action: () => Promise<unknown>;
  variant?: Variant;
  confirmVariant?: Variant;
  label: React.ReactNode;
  confirmLabel: React.ReactNode;
  confirmHint?: string;
  icon?: React.ReactNode;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        {confirmHint && (
          <span className="text-xs text-warning max-w-[220px]">{confirmHint}</span>
        )}
        <Button
          size="sm"
          variant={confirmVariant}
          disabled={busy}
          onClick={() =>
            startTransition(async () => {
              await action();
              setConfirming(false);
              router.refresh();
            })
          }
        >
          {confirmLabel}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => setConfirming(false)}
        >
          {t("cancel")}
        </Button>
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant={variant}
      disabled={busy}
      onClick={() => setConfirming(true)}
      className="gap-1.5"
    >
      {icon}
      {label}
    </Button>
  );
}
