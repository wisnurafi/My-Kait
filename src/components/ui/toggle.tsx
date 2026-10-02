"use client";

import { cn } from "@/lib/utils";

/**
 * Toggle — rounded pill, lime when on, sunken when off.
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
          "relative w-12 h-7 rounded-full border cursor-pointer",
          "transition-colors duration-200",
          checked ? "bg-accent border-transparent" : "bg-sunken border-border-ink",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full border transition-all duration-200",
            checked
              ? "left-[22px] bg-[#0a0a0b] border-transparent"
              : "left-0.5 bg-surface border-border-strong",
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <div className="text-sm font-semibold">{label}</div>}
          {description && <div className="text-xs text-fg-secondary">{description}</div>}
        </div>
      )}
    </label>
  );
}
