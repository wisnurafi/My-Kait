"use client";

/**
 * Logs view — filter, search, summary, detail drawer.
 * See PRD sections 3.8, 3.8.1.
 */

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { clearLogsAction, deleteMessageAction } from "@/server/actions/messages";
import { saveAsTemplateAction } from "@/server/actions/templates";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Send,
  Pencil,
  Eye,
  RefreshCw,
  Download,
  Save,
} from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { DiscordPreview } from "@/components/editor/discord-preview";
import { useState as useReactState } from "react";

type MessageStatus = "sent" | "failed" | "rate_limited" | "edited" | "deleted";
type MessageMode = "normal" | "embed" | "both";

const statusConfig: Record<MessageStatus, { variant: "success" | "danger" | "warning" | "info" | "default"; icon: string }> = {
  sent: { variant: "success", icon: "✓" },
  failed: { variant: "danger", icon: "✕" },
  rate_limited: { variant: "warning", icon: "⏳" },
  edited: { variant: "info", icon: "✎" },
  deleted: { variant: "default", icon: "🗑" },
};

export function LogsView({
  logsData,
  webhooks,
  currentFilters,
}: {
  logsData: {
    logs: Array<{
      id: string;
      webhookNameSnapshot: string;
      mode: MessageMode;
      webhookId: string | null;
      payload: Record<string, unknown> | null;
      status: MessageStatus;
      httpStatus: number | null;
      latencyMs: number | null;
      discordMessageId: string | null;
      error: string | null;
      source: string;
      createdAt: Date;
    }>;
    total: number;
    page: number;
    totalPages: number;
    summary: { sent: number; failed: number; successRate: number };
  };
  webhooks: Array<{ id: string; name: string }>;
  currentFilters: Record<string, string | undefined>;
}) {
  const t = useTranslations("logs");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedLog, setSelectedLog] = useState<(typeof logsData.logs)[0] | null>(null);
  const [search, setSearch] = useReactState(currentFilters.search ?? "");

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(currentFilters as Record<string, string>);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (currentFilters.search ?? "")) {
        updateFilter("search", search);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function applySearch() {
    updateFilter("search", search);
  }

  function handlePageChange(newPage: number) {
    updateFilter("page", String(newPage));
  }

  function handleClearLogs() {
    if (!confirm(t("confirmClear"))) return;
    startTransition(async () => {
      await clearLogsAction();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-3xl font-bold uppercase">{t("title")}</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const csv = exportToCsv(logsData.logs);
              downloadFile(csv, "logs.csv", "text/csv");
            }}
            className="gap-1.5"
          >
            <Download size={14} /> CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const json = JSON.stringify(logsData.logs, null, 2);
              downloadFile(json, "logs.json", "application/json");
            }}
            className="gap-1.5"
          >
            <Download size={14} /> JSON
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearLogs}
            disabled={pending}
            className="text-error gap-1.5"
          >
            <Trash2 size={14} />
            {t("clearLogs")}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-surface border-[3px] border-border-ink">
          <div className="text-2xl font-display font-bold text-success">{logsData.summary.sent}</div>
          <div className="text-sm text-fg-secondary">{t("summary.sent")}</div>
        </Card>
        <Card className="p-4 bg-surface border-[3px] border-border-ink">
          <div className="text-2xl font-display font-bold text-error">{logsData.summary.failed}</div>
          <div className="text-sm text-fg-secondary">{t("summary.failed")}</div>
        </Card>
        <Card className="p-4 bg-surface border-[3px] border-border-ink">
          <div className="text-2xl font-display font-bold">{logsData.summary.successRate}%</div>
          <div className="text-sm text-fg-secondary">{t("summary.successRate")}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-surface border-[3px] border-border-ink">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Label>{t("filterStatus")}</Label>
            <Select
              value={currentFilters.status ?? ""}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">Semua</option>
              <option value="sent">Terkirim</option>
              <option value="failed">Gagal</option>
              <option value="rate_limited">Rate limited</option>
              <option value="edited">Diedit</option>
              <option value="deleted">Dihapus</option>
            </Select>
          </div>
          <div>
            <Label>{t("filterWebhook")}</Label>
            <Select
              value={currentFilters.webhookId ?? ""}
              onChange={(e) => updateFilter("webhookId", e.target.value)}
            >
              <option value="">Semua</option>
              {webhooks.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{t("filterMode")}</Label>
            <Select
              value={currentFilters.mode ?? ""}
              onChange={(e) => updateFilter("mode", e.target.value)}
            >
              <option value="">Semua</option>
              <option value="normal">Normal</option>
              <option value="embed">Embed</option>
              <option value="both">Pesan + Embed</option>
            </Select>
          </div>
          <div>
            <Label>{t("filterDate")}</Label>
            <Select
              value={currentFilters.datePreset ?? "30d"}
              onChange={(e) => updateFilter("datePreset", e.target.value)}
            >
              <option value="today">{t("datePresets.today")}</option>
              <option value="7d">{t("datePresets.7d")}</option>
              <option value="30d">{t("datePresets.30d")}</option>
            </Select>
          </div>
          <div>
            <Label>Urutan</Label>
            <Select
              value={currentFilters.sort ?? "newest"}
              onChange={(e) => updateFilter("sort", e.target.value)}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </Select>
          </div>
        </div>

        <div className="mt-3 flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary" size={16} />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={handleSearch}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              className="pl-9 bg-sunken border-[3px] border-border-ink font-mono text-[15px]"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={applySearch}>Cari</Button>
          <div className="flex items-center gap-2 flex-wrap">
            {currentFilters.status && (
              <button
                onClick={() => updateFilter("status", "")}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] border-2 border-border-ink bg-surface text-fg"
              >
                {t(`status.${currentFilters.status}`)} <X size={10} />
              </button>
            )}
            {currentFilters.mode && (
              <button
                onClick={() => updateFilter("mode", "")}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] border-2 border-border-ink bg-surface text-fg"
              >
                {currentFilters.mode} <X size={10} />
              </button>
            )}
            {currentFilters.search && (
              <button
                onClick={() => updateFilter("search", "")}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] border-2 border-border-ink bg-surface text-fg"
              >
                "{currentFilters.search}" <X size={10} />
              </button>
            )}
            {(currentFilters.status || currentFilters.webhookId || currentFilters.mode || currentFilters.search) && (
              <Button variant="ghost" size="sm" onClick={() => router.push("?")} className="gap-1">
                <X size={14} /> Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Logs list */}
      {logsData.logs.length === 0 ? (
        <Card className="p-12 text-center bg-surface border-[3px] border-border-ink">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-fg-secondary text-lg">{t("noLogs")}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {logsData.logs.map((log) => {
            const sc = statusConfig[log.status];
            return (
              <Card key={log.id} className="p-4 bg-surface border-[3px] border-border-ink" hover>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    <Badge variant={sc.variant} className="flex-shrink-0">
                      {sc.icon} {t(`status.${log.status}`)}
                    </Badge>
                    <div>
                      <div className="font-semibold text-sm">{log.webhookNameSnapshot}</div>
                      <div className="text-xs text-fg-secondary">
                        {log.mode} · {log.source}
                        {log.httpStatus && ` · HTTP ${log.httpStatus}`}
                        {log.latencyMs != null && ` · ${log.latencyMs}ms`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-fg-tertiary">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="gap-1"
                    >
                      <Eye size={14} />
                      Detail
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Pagination */}
          {logsData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(logsData.page - 1)}
                disabled={logsData.page <= 1}
                className="gap-1"
              >
                <ChevronLeft size={16} /> Prev
              </Button>
              <span className="text-sm text-fg-secondary">
                {logsData.page} / {logsData.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(logsData.page + 1)}
                disabled={logsData.page >= logsData.totalPages}
                className="gap-1"
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Detail drawer */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ backgroundColor: "color-mix(in srgb, var(--fg) 70%, transparent)" }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-surface border-l-[5px] border-border-ink overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold uppercase">Detail</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Meta */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-fg-secondary">{t("detail.messageId")}</span>
                  <span className="font-mono text-xs">{selectedLog.discordMessageId ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-secondary">Status</span>
                  <Badge variant={statusConfig[selectedLog.status].variant}>
                    {t(`status.${selectedLog.status}`)}
                  </Badge>
                </div>
                {selectedLog.httpStatus && (
                  <div className="flex justify-between">
                    <span className="text-fg-secondary">HTTP</span>
                    <span>{selectedLog.httpStatus}</span>
                  </div>
                )}
                {selectedLog.latencyMs != null && (
                  <div className="flex justify-between">
                    <span className="text-fg-secondary">{t("detail.duration")}</span>
                    <span>{selectedLog.latencyMs}ms</span>
                  </div>
                )}
                {selectedLog.error && (
                  <div>
                    <div className="text-fg-secondary mb-1">{t("detail.error")}</div>
                    <div className="text-xs p-2 bg-surface text-error border-[1px] border-error">
                      {selectedLog.error}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
            {selectedLog.payload && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    const payload = JSON.stringify(selectedLog.payload);
                    sessionStorage.setItem("mykait-import-payload", payload);
                    router.push("/editor");
                  }}
                >
                  <Copy size={14} /> Duplikasi ke Editor
                </Button>
                {selectedLog.status === "failed" && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      const payload = JSON.stringify(selectedLog.payload);
                      sessionStorage.setItem("mykait-import-payload", payload);
                      router.push("/editor");
                    }}
                  >
                    <RefreshCw size={14} /> Kirim Ulang
                  </Button>
                )}
                {selectedLog.discordMessageId && selectedLog.webhookId && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        const payload = JSON.stringify(selectedLog.payload);
                        sessionStorage.setItem("mykait-import-payload", payload);
                        sessionStorage.setItem("mykait-edit-message-id", selectedLog.discordMessageId ?? "");
                        router.push("/editor");
                      }}
                    >
                      <Pencil size={14} /> Edit Pesan
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      disabled={!selectedLog.discordMessageId}
                      onClick={() => {
                        if (!confirm("Hapus pesan ini dari Discord?")) return;
                        const fd = new FormData();
                        fd.set("logId", selectedLog.id);
                        startTransition(async () => {
                          await deleteMessageAction(null, fd);
                          setSelectedLog(null);
                        });
                      }}
                    >
                      <Trash2 size={14} /> Hapus Pesan
                    </Button>
                  </>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  disabled={!selectedLog.payload}
                  onClick={() => {
                    startTransition(async () => {
                      const fd = new FormData();
                      fd.set("name", `${selectedLog.webhookNameSnapshot} (dari log)`);
                      fd.set("payload", JSON.stringify(selectedLog.payload ?? {}));
                      await saveAsTemplateAction(null, fd);
                    });
                  }}
                >
                  <Save size={14} /> Simpan Template
                </Button>
              </div>
            )}

            {/* Payload preview */}
            {selectedLog.payload && (
              <div>
                <h3 className="font-display text-sm uppercase mb-2">{t("detail.payload")}</h3>
                <DiscordPreview
                  payload={selectedLog.payload ?? {}}
                  username="My Kait"
                />
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

/* --- Export helpers --- */

function exportToCsv(logs: Array<{ webhookNameSnapshot: string; mode: string; status: string; httpStatus: number | null; latencyMs: number | null; error: string | null; createdAt: Date }>): string {
  const headers = ["Waktu", "Webhook", "Mode", "Status", "HTTP", "Latency", "Error"];
  const rows = logs.map((l) => [
    new Date(l.createdAt).toISOString(),
    l.webhookNameSnapshot,
    l.mode,
    l.status,
    l.httpStatus ?? "",
    l.latencyMs ?? "",
    (l.error ?? "").replace(/"/g, '""'),
  ]);
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
