/**
 * RawBlock Badge — status chip style.
 * Square, 2px border, uppercase, tracking, no radius, no shadow.
 *
 * Variants map to status colors:
 *   active → green, warning → orange, error → red, default → black.
 * Also supports status colors used across the app: success, warning, error, info.
 */
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "active"
  | "success"
  | "warning"
  | "danger"
  | "error"
  | "info";

const variantClasses: Record<BadgeVariant, string> = {
  // White fill, black text, black border
  default: "bg-surface text-fg border-border-ink",
  // White fill, green text, green border
  active: "bg-surface text-success border-success",
  success: "bg-surface text-success border-success",
  // White fill, orange text, orange border
  warning: "bg-surface text-warning border-warning",
  // White fill, red text, red border
  danger: "bg-surface text-error border-error",
  error: "bg-surface text-error border-error",
  // White fill, blue text, blue border
  info: "bg-surface text-link border-link",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5",
        "text-[11px] font-bold uppercase tracking-[0.05em] leading-none",
        "border-2",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * RawBlock Filter Chip — toggleable filter.
 * White fill, black text, 2px border. Active: black bg, white text.
 */
export function FilterChip({
  children,
  active = false,
  onClick,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em] leading-none",
        "border-2 border-border-ink cursor-pointer transition-colors duration-100",
        active
          ? "bg-fg text-bg"
          : "bg-surface text-fg hover:bg-sunken",
        className,
      )}
    >
      {children}
    </button>
  );
}
