"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { signOut } from "next-auth/react";
import { deleteAccountAction } from "@/server/actions/messages";
import { exportUserDataAction } from "@/server/actions/export";
import { Link } from "@/i18n/routing";

export function SettingsClient({
  user,
}: {
  user: { name?: string | null; image?: string | null } | null;
}) {
  const t = useTranslations("settings");
  const [savePayload, setSavePayload] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportUserDataAction();
      if (result.success) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mykait-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-3xl uppercase">{t("title")}</h1>

      {/* Profile */}
      <Card>
        <CardBody>
          <h2 className="font-display text-xl uppercase mb-4">{t("profile")}</h2>
          <div className="flex items-center gap-4">
            {user?.image ? (
              <img
                src={user.image}
                alt="Avatar"
                className="w-16 h-16 border-[3px] border-border-ink"
              />
            ) : (
              <div className="w-16 h-16 bg-sunken border-[3px] border-border-ink flex items-center justify-center text-2xl">
                👤
              </div>
            )}
            <div>
              <div className="font-bold">{user?.name}</div>
              <div className="text-sm text-fg-secondary">{t("loginViaDiscord")}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Preferences */}
      <Card>
        <CardBody>
          <h2 className="font-display text-xl uppercase mb-4">{t("preferences")}</h2>
          <div className="space-y-4">
            <div>
              <Label>{t("language")}</Label>
              <div className="flex gap-2 mt-2">
                <Badge variant="info">🇮🇩 ID</Badge>
                <Badge variant="default">🇬🇧 EN</Badge>
              </div>
            </div>
            <div>
              <Label>{t("logRetention")}</Label>
              <p className="text-sm text-fg-secondary mt-1">{t("logRetentionDesc")}</p>
            </div>
            <Toggle
              checked={savePayload}
              onChange={setSavePayload}
              label={t("savePayload")}
              description={t("savePayloadDesc")}
            />
          </div>
        </CardBody>
      </Card>

      {/* Data export */}
      <Card>
        <CardBody>
          <h2 className="font-display text-xl uppercase mb-4">{t("dataExport")}</h2>
          <p className="text-sm text-fg-secondary mb-4">{t("dataExportDesc")}</p>
          <Button variant="secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? t("exporting") : t("exportButton")}
          </Button>
        </CardBody>
      </Card>

      {/* Danger zone */}
      <Card className="border-error">
        <CardBody>
          <h2 className="font-display text-xl uppercase text-error mb-2">{t("deleteAccount")}</h2>
          <p className="text-sm text-fg-secondary mb-4">{t("deleteAccountDesc")}</p>
          {confirming ? (
            <div className="space-y-3">
              <Label>{t("deleteAccountConfirm")}</Label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full h-11 px-4 bg-sunken text-fg font-mono text-[15px] border-[3px] border-border-ink focus:outline-none focus:border-[5px] focus:px-2.5 focus:py-2"
                placeholder="DELETE"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  disabled={confirmText !== "DELETE"}
                  onClick={async () => {
                    await deleteAccountAction();
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  {t("deleteAccountButton")}
                </Button>
                <Button variant="ghost" onClick={() => { setConfirming(false); setConfirmText(""); }}>
                  {t("cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setConfirming(true)}>
              {t("deleteAccountButton")}
            </Button>
          )}
        </CardBody>
      </Card>
      {/* Legal */}
      <div className="flex gap-4 justify-center text-sm">
        <Link href="/privacy" className="text-fg-secondary hover:text-link">
          {t("privacy")}
        </Link>
        <Link href="/terms" className="text-fg-secondary hover:text-link">
          {t("terms")}
        </Link>
      </div>
    </div>
  );
}
