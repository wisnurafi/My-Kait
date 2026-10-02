"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWebhookAction } from "@/server/actions/webhooks";
import { Pencil, Check, X } from "lucide-react";

export function EditWebhookForm({
  webhookId,
  currentName,
  onDone,
}: {
  webhookId: string;
  currentName: string;
  onDone: () => void;
}) {
  const [name, setName] = useState(currentName);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", webhookId);
      formData.set("name", name);
      const result = await updateWebhookAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-8 text-sm font-mono"
        autoFocus
      />
      <Button type="submit" size="sm" variant="primary" disabled={pending} className="h-8 w-8 p-0">
        <Check size={14} />
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onDone} className="h-8 w-8 p-0">
        <X size={14} />
      </Button>
      {error && <span className="text-xs text-error">{error}</span>}
    </form>
  );
}
