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
} from "@/server/actions/templates";
import {
  createFolderAction,
  renameFolderAction,
  deleteFolderAction,
  moveTemplateToFolderAction,
} from "@/server/actions/folders";
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
  FolderPlus,
  Folder,
  FolderOpen,
  LayoutGrid,
  FileQuestion,
} from "lucide-react";
import { useState as useReactState } from "react";

type Template = {
  id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  payload: unknown;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Folder = {
  id: string;
  name: string;
  templateCount: number;
};

export function TemplatesList({
  templates: initial,
  folders,
  activeFolder,
}: {
  templates: Template[];
  folders: Folder[];
  activeFolder: string;
}) {
  const t = useTranslations("templates");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useReactState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTags, setEditTags] = useState("");
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  function pushParams(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`/templates?${params.toString()}`);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    const params = new URLSearchParams();
    if (e.target.value) params.set("search", e.target.value);
    if (activeFolder !== "all") params.set("folder", activeFolder);
    router.push(`/templates?${params.toString()}`);
  }

  function selectFolder(id: string) {
    pushParams({ folder: id === "all" ? undefined : id });
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

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", newFolderName.trim());
      const result = await createFolderAction(fd);
      if (result.success) {
        setNewFolderName("");
        setShowNewFolder(false);
      } else if (result.error) {
        alert(result.error);
      }
    });
  }

  function handleRenameFolder(id: string) {
    if (!renameValue.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("name", renameValue.trim());
      const result = await renameFolderAction(fd);
      if (result.success) {
        setRenamingId(null);
      } else if (result.error) {
        alert(result.error);
      }
    });
  }

  function handleDeleteFolder(id: string, name: string) {
    if (!confirm(t("folders.confirmDelete", { name }))) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteFolderAction(fd);
      if (activeFolder === id) selectFolder("all");
    });
  }

  function handleMoveTemplate(templateId: string, folderId: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("templateId", templateId);
      fd.set("folderId", folderId === "unfiled" ? "" : folderId);
      await moveTemplateToFolderAction(fd);
    });
  }

  const allTags = [...new Set(initial.flatMap((t) => t.tags ?? []))];

  const folderButton = (
    id: string,
    label: string,
    icon: React.ReactNode,
    count?: number,
  ) => (
    <button
      key={id}
      onClick={() => selectFolder(id)}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-[0.05em] border-2 text-left transition-colors ${
        activeFolder === id
          ? "bg-ink text-paper border-border-ink"
          : "border-transparent hover:border-border-ink"
      }`}
    >
      {icon}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="text-xs font-mono">{count}</span>
      )}
    </button>
  );

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Folder sidebar */}
      <aside className="w-full lg:w-60 shrink-0">
        <div className="lg:sticky lg:top-4 space-y-1 bg-surface border-[3px] border-border-ink p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-sm uppercase flex items-center gap-1.5">
              <Folder size={14} />
              {t("folders.title")}
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNewFolder((v) => !v)}
              title={t("folders.new")}
              className="gap-1"
            >
              <FolderPlus size={14} />
            </Button>
          </div>

          {showNewFolder && (
            <div className="flex gap-1 mb-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={t("folders.namePlaceholder")}
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                autoFocus
              />
              <Button size="sm" onClick={handleCreateFolder} disabled={pending}>
                <Check size={14} />
              </Button>
            </div>
          )}

          {folderButton("all", t("folders.all"), <LayoutGrid size={15} />, initial.length)}
          {folderButton(
            "unfiled",
            t("folders.unfiled"),
            <FileQuestion size={15} />,
          )}

          {folders.map((folder) =>
            renamingId === folder.id ? (
              <div key={folder.id} className="flex gap-1 px-1">
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleRenameFolder(folder.id)}
                  autoFocus
                />
                <Button size="sm" onClick={() => handleRenameFolder(folder.id)} disabled={pending}>
                  <Check size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRenamingId(null)}>
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <div key={folder.id} className="group flex items-center">
                <div className="flex-1 min-w-0">
                  {folderButton(
                    folder.id,
                    folder.name,
                    activeFolder === folder.id ? <FolderOpen size={15} /> : <Folder size={15} />,
                    folder.templateCount,
                  )}
                </div>
                <div className="hidden group-hover:flex shrink-0">
                  <button
                    onClick={() => {
                      setRenamingId(folder.id);
                      setRenameValue(folder.name);
                    }}
                    className="p-1.5 text-fg-tertiary hover:text-fg"
                    title={t("folders.rename")}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id, folder.name)}
                    className="p-1.5 text-fg-tertiary hover:text-error"
                    title={t("folders.delete")}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
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
                onClick={() => pushParams({ tag })}
                className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.05em] border-2 border-border-ink hover:bg-sunken"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Templates grid */}
        {initial.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-fg-secondary text-lg">{t("noTemplates")}</p>
            <p className="text-sm text-fg-tertiary mt-2">{t("noTemplatesHint")}</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {initial.map((template) => (
              <Card key={template.id} className="p-5" hover>
                {editingId === template.id ? (
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
                    {/* Move to folder */}
                    {folders.length > 0 && (
                      <div className="mb-3">
                        <select
                          value={template.folderId ?? "unfiled"}
                          onChange={(e) => handleMoveTemplate(template.id, e.target.value)}
                          disabled={pending}
                          className="w-full h-8 text-xs font-bold uppercase tracking-[0.05em] bg-sunken border-2 border-border-ink px-2"
                          title={t("folders.moveTo")}
                        >
                          <option value="unfiled">{t("folders.unfiled")}</option>
                          {folders.map((f) => (
                            <option key={f.id} value={f.id}>
                              📁 {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
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
        )}
      </div>
    </div>
  );
}
