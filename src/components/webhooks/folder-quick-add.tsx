"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/toast";
import { createFolderAction } from "@/server/actions/folders";
import { Check, FolderPlus } from "lucide-react";

/**
 * Inline "new folder" control for the webhooks page filter row.
 * Folders are shared with templates — creating one here makes it
 * available on the templates page too.
 */
export function FolderQuickAdd() {
  const t = useTranslations("webhooks");
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name.trim());
      const result = await createFolderAction(fd);
      if (result.success) {
        setName("");
        setOpen(false);
        toast.success(t("folderCreated"));
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-xs uppercase tracking-[0.08em] px-3 py-1.5 rounded-full border border-dashed border-border-ink text-fg-secondary hover:text-accent hover:border-accent transition-colors inline-flex items-center gap-1.5"
      >
        <FolderPlus size={13} />
        {t("folderNew")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("folderNamePlaceholder")}
        className="h-8 text-sm w-44"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreate();
          if (e.key === "Escape") {
            setOpen(false);
            setName("");
          }
        }}
        autoFocus
      />
      <Tooltip content={t("folderCreate")}>
        <Button size="sm" onClick={handleCreate} disabled={pending || !name.trim()}>
          <Check size={14} />
        </Button>
      </Tooltip>
    </div>
  );
}
