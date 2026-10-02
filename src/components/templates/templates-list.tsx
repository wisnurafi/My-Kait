"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteTemplateAction,
  duplicateTemplateAction,
  createShareLinkAction,
  revokeShareLinkAction,
} from "@/server/actions/templates";
import {
  Search,
  Trash2,
  Copy,
  Share2,
  ExternalLink,
  Pencil,
  Check,
  X,
  Plus,
} from "lucide-react";
import { useState as useReactState } from "react";

type Template = {
  id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  payload: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export function TemplatesList({ templates: initial }: { templates: Template[] }) {
  const t = useTranslations("templates");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useReactState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTags, setEditTags] = useState("");
  const [shareSlug, setShareSlug] = useState<string | null>(null);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    const params = new URLSearchParams();
    if (e.target.value) params.set("search", e.target.value);
    router.push(`/templates?${params.toString()}`);
  }

  function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteTemplateAction(fd);
    });
  }

  function handleDuplicate(id: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await duplicateTemplateAction(fd);
    });
  }

  function handleShare(id: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("templateId", id);
      const result = await createShareLinkAction(fd);
      if (result.success && result.slug) {
        setShareSlug(result.slug);
      }
    });
  }

  function handleLoad(id: string) {
    // Load template payload to editor via sessionStorage
    const template = initial.find((t) => t.id === id);
    if (!template) return;
    sessionStorage.setItem("mykait-import-payload", JSON.stringify(template.payload));
    router.push("/editor");
  }

  function handleSaveEdit(id: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("name", editName);
      fd.set("description", editDesc);
      fd.set("tags", editTags);
      await (await import("@/server/actions/templates")).updateTemplateAction(fd);
      setEditingId(null);
    });
  }

  function startEdit(template: Template) {
    setEditingId(template.id);
    setEditName(template.name);
    setEditDesc(template.description ?? "");
    setEditTags((template.tags ?? []).join(", "));
  }

  // Collect all unique tags
  const allTags = [...new Set(initial.flatMap((t) => t.tags ?? []))];

  if (initial.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl uppercase">{t("title")}</h1>
        <Card className="p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-fg-secondary text-lg">{t("noTemplates")}</p>
          <p className="text-sm text-fg-tertiary mt-2">{t("noTemplatesHint")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl uppercase">{t("title")}</h1>

      {/* Search */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary" size={16} />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                const params = new URLSearchParams();
                params.set("tag", tag);
                router.push(`/templates?${params.toString()}`);
              }}
              className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.05em] border-2 border-border-ink hover:bg-sunken"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Templates grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initial.map((template) => (
          <Card key={template.id} className="p-5" hover>
            {editingId === template.id ? (
              /* Edit mode */
              <div className="space-y-3">
                <div>
                  <Label>{t("name")}</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <Label>{t("description")}</Label>
                  <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} />
                </div>
                <div>
                  <Label>{t("tags")}</Label>
                  <Input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="tag1, tag2" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSaveEdit(template.id)} className="gap-1.5">
                    <Check size={14} /> {t("save")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X size={14} />
                  </Button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div>
                <h3 className="font-display text-lg uppercase mb-1">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-fg-secondary mb-2">{template.description}</p>
                )}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-fg-tertiary mb-3">
                  {new Date(template.updatedAt).toLocaleDateString("id-ID")}
                </p>
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="primary" onClick={() => handleLoad(template.id)} className="gap-1.5">
                    <Plus size={14} /> {t("load")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(template)} className="gap-1">
                    <Pencil size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDuplicate(template.id)} className="gap-1">
                    <Copy size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleShare(template.id)} className="gap-1">
                    <Share2 size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(template.id)} className="text-error gap-1">
                    <Trash2 size={14} />
                  </Button>
                </div>
                {shareSlug && (
                  <div className="mt-3 p-2 bg-sunken border-2 border-border-ink">
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/t/${shareSlug}`}
                        className="text-xs h-8"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/t/${shareSlug}`)}
                      >
                        <Copy size={12} />
                      </Button>
                      <a href={`/t/${shareSlug}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost">
                          <ExternalLink size={14} />
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
