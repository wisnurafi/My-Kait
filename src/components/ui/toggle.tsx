"use client";

import { cn } from "@/lib/utils";

/**
 * Cozy Toggle — rounded pill, sage when on, soft shadow.
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
          "relative w-12 h-7 rounded-full border border-border cursor-pointer shadow-sm",
          "transition-colors duration-200",
          checked ? "bg-accent border-transparent" : "bg-sunken",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow transition-all duration-200",
            checked ? "left-[22px]" : "left-0.5",
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
