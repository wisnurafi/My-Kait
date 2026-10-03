"use client";

/**
 * Toggle a share link active/inactive.
 */

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { setShareActive } from "@/server/actions/admin";

export function ShareToggle({
  shareId,
  isActive,
}: {
  shareId: string;
  isActive: boolean;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={isActive ? "secondary" : "primary"}
      disabled={busy}
      onClick={() =>
        startTransition(async () => {
          await setShareActive(shareId, !isActive);
          router.refresh();
        })
      }
    >
      {isActive ? t("deactivate") : t("activate")}
    </Button>
  );
}
