"use client";

/**
 * Image upload component for embed images.
 * Uploads to Vercel Blob, returns URL.
 * See PRD section 3.10 (P2).
 * RawBlock styling: no radius, thick borders, uppercase tabs.
 */

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, X, Link as LinkIcon, Loader2 } from "lucide-react";

export function ImageUpload({
  value,
  onChange,
  label,
  placeholder = "https://… atau upload",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload gagal");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Upload gagal. Coba lagi.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block font-display text-[14px] uppercase mb-1">{label}</label>
      )}

      {/* Mode tabs */}
      <div className="flex gap-0 mb-1.5">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase tracking-[0.05em] border-[2px] border-border-ink cursor-pointer transition-colors duration-100",
            mode === "url"
              ? "bg-fg text-bg"
              : "bg-surface text-fg hover:bg-sunken",
          )}
        >
          <LinkIcon size={12} /> URL
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase tracking-[0.05em] border-[2px] border-border-ink border-l-0 cursor-pointer transition-colors duration-100",
            mode === "upload"
              ? "bg-fg text-bg"
              : "bg-surface text-fg hover:bg-sunken",
          )}
        >
          <Upload size={12} /> Upload
        </button>
      </div>

      {mode === "url" ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="text-error"
            >
              <X size={14} />
            </Button>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center h-11 px-4 text-sm border-[3px] border-dashed border-border-ink cursor-pointer hover:bg-surface-hover transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Uploading…
            </>
          ) : value ? (
            <div className="flex items-center gap-2 w-full">
              <img src={value} alt="" className="h-8 w-8 object-cover" />
              <span className="text-xs text-fg-secondary truncate flex-1 font-mono">{value}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="text-error"
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <span className="text-fg-tertiary font-mono text-xs">Drop image atau klik untuk upload (max 8MB)</span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = ""; // Reset for re-upload
            }}
          />
        </div>
      )}

      {error && <p className="text-xs text-error font-mono">{error}</p>}
    </div>
  );
}
