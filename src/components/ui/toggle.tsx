"use client";

import { cn } from "@/lib/utils";

/**
 * RawBlock Toggle — square, thick border, inversion on check.
 * No radius, no shadow.
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-12 h-7 border-[3px] border-border-ink cursor-pointer",
          "transition-colors duration-100",
          "active:translate-y-0.5",
          checked ? "bg-fg" : "bg-sunken",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-4 h-4 border-2 border-border-ink transition-all duration-100",
            checked ? "left-6 bg-bg" : "left-0.5 bg-surface",
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <div className="text-sm font-bold">{label}</div>}
          {description && <div className="text-xs text-fg-secondary">{description}</div>}
        </div>
      )}
    </label>
  );
}
