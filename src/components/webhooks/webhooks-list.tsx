"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useFormatter } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  pingWebhookAction,
  deleteWebhookAction,
  sendTestMessageAction,
  pingAllWebhooksAction,
} from "@/server/actions/webhooks";
import { PingHistory } from "@/components/webhooks/ping-history";
import { EditWebhookForm } from "@/components/webhooks/edit-webhook-form";
import { Search, Zap, Trash2, Send, RefreshCw, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

type WebhookStatus = "active" | "invalid" | "rate_limited" | "unchecked";

const statusConfig: Record<WebhookStatus, { variant: "success" | "danger" | "warning" | "default"; icon: string }> = {
  active: { variant: "success", icon: "●" },
  invalid: { variant: "danger", icon: "✕" },
  rate_limited: { variant: "warning", icon: "⏳" },
  unchecked: { variant: "default", icon: "?" },
};

export function WebhooksList({
  webhooks: initialWebhooks,
}: {
  webhooks: Array<{
    id: string;
    name: string;
    discordWebhookId: string | null;
    lastStatus: WebhookStatus;
    lastCheckedAt: Date | null;
    lastUsedAt: Date | null;
    channelName: string | null;
    guildName: string | null;
    createdAt: Date;
  }>;
}) {
  const t = useTranslations("webhooks");
  const format = useFormatter();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const filteredWebhooks = statusFilter
    ? initialWebhooks.filter((w) => w.lastStatus === statusFilter)
    : initialWebhooks;

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    const params = new URLSearchParams();
    if (e.target.value) params.set("search", e.target.value);
    router.push(`?${params.toString()}`);
  }

  function handlePing(webhookId: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("webhookId", webhookId);
      await pingWebhookAction(formData);
    });
  }

  function handleDelete(webhookId: string) {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("webhookId", webhookId);
      await deleteWebhookAction(formData);
    });
  }

  function handleTestSend(webhookId: string) {
    if (!confirm(t("testConfirm"))) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("webhookId", webhookId);
      const result = await sendTestMessageAction(formData);
      if (result.error) alert(result.error);
    });
  }

  function handlePingAll() {
    startTransition(async () => {
      await pingAllWebhooksAction();
    });
  }

  if (filteredWebhooks.length === 0 && !search) {
    return (
      <Card className="bg-surface border-[3px] border-border-ink p-12 text-center">
        <div className="text-5xl mb-4">🪝</div>
        <p className="text-fg-secondary text-lg">{t("noWebhooks")}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary" size={16} />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={handleSearch}
            className="pl-9 font-mono"
          />
        </div>
        <Button variant="secondary" size="md" onClick={handlePingAll} disabled={pending} className="gap-2">
          <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
          {t("pingAll")}
        </Button>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-auto"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="active">{t("status.active")}</option>
          <option value="invalid">{t("status.invalid")}</option>
          <option value="unchecked">{t("status.unchecked")}</option>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredWebhooks.map((wh) => {
          const sc = statusConfig[wh.lastStatus];
          const isExpanded = expandedId === wh.id;
          return (
            <Card key={wh.id} className="bg-surface border-[3px] border-border-ink p-5" hover>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {editingId === wh.id ? (
                      <EditWebhookForm
                        webhookId={wh.id}
                        currentName={wh.name}
                        onDone={() => setEditingId(null)}
                      />
                    ) : (
                      <h3 className="font-display text-lg font-bold uppercase tracking-[0.05em]">{wh.name}</h3>
                    )}
                    <Badge variant={sc.variant}>
                      {sc.icon} {t(`status.${wh.lastStatus}`)}
                    </Badge>
                  </div>
                  {wh.guildName && wh.channelName && (
                    <p className="text-sm text-fg-secondary mt-1">
                      #{wh.channelName} · {wh.guildName}
                    </p>
                  )}
                  {wh.lastCheckedAt && (
                    <p className="text-xs text-fg-tertiary mt-1">
                      {t("lastChecked")}: {format.dateTime(wh.lastCheckedAt, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePing(wh.id)}
                    disabled={pending}
                    className="gap-1.5"
                  >
                    <Zap size={14} />
                    {t("ping")}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleTestSend(wh.id)}
                    disabled={pending}
                    className="gap-1.5"
                  >
                    <Send size={14} />
                    {t("sendTest")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : wh.id)}
                    className="gap-1.5"
                  >
                    {isExpanded ? "Tutup" : "Riwayat"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(editingId === wh.id ? null : wh.id)}
                    className="gap-1.5"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(wh.id)}
                    disabled={pending}
                    className="text-error"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              {isExpanded && <PingHistory webhookId={wh.id} />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
