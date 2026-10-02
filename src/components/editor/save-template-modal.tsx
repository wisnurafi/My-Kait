"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveAsTemplateAction } from "@/server/actions/templates";
import { X, Save } from "lucide-react";

export function SaveTemplateModal({
  payload,
  onClose,
}: {
  payload: Record<string, unknown>;
  onClose: () => void;
}) {
  const t = useTranslations("templates");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      formData.set("payload", JSON.stringify(payload));
      const res = await saveAsTemplateAction(null, formData);
      setResult(res);
      if (res.success) {
        setTimeout(onClose, 1500);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "color-mix(in srgb, var(--fg) 70%, transparent)" }} onClick={onClose}>
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <Card className="p-5 bg-surface border-[3px] border-border-ink">
          <div className="flex items-center justify-between mb-4 border-b-[1px] border-border-ink pb-3">
            <h2 className="font-display text-xl uppercase">{t("saveAs")}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label required>{t("name")}</Label>
              <Input name="name" placeholder={t("namePlaceholder")} required />
            </div>
            <div>
              <Label>{t("description")}</Label>
              <Textarea name="description" rows={2} placeholder={t("descriptionPlaceholder")} />
            </div>
            <div>
              <Label>{t("tags")}</Label>
              <Input name="tags" placeholder="tag1, tag2, tag3" />
            </div>
            {result?.error && (
              <p className="text-sm text-error font-semibold uppercase tracking-[0.05em]">{result.error}</p>
            )}
            {result?.success && (
              <p className="text-sm text-success font-semibold uppercase tracking-[0.05em]">{result.message}</p>
            )}
            <Button type="submit" disabled={pending} className="w-full gap-2 uppercase tracking-[0.05em]">
              {pending ? (
                <span className="inline-block h-4 w-4 animate-spin border-[3px] border-current border-t-transparent" />
              ) : (
                <Save size={18} />
              )}
              {t("save")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
