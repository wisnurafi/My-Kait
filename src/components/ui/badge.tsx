/**
 * Cozy Badge — soft rounded pills with warm tinted backgrounds.
 * `pulse` adds a gentle pulse dot (great for "active" webhook status).
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
  default: "bg-surface-hover text-fg-secondary border-border",
  active: "bg-success-soft text-success border-success/30",
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-error-soft text-error border-error/30",
  error: "bg-error-soft text-error border-error/30",
  info: "bg-info-soft text-info border-info/30",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-fg-tertiary",
  active: "bg-success",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-error",
  error: "bg-error",
  info: "bg-info",
};

export function Badge({
  children,
  variant = "default",
  className,
  pulse = false,
  dot = false,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  /** Pulsing dot — use for live/active states */
  pulse?: boolean;
  /** Static status dot */
  dot?: boolean;
}) {
  const showDot = pulse || dot;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1",
        "text-[11px] font-bold tracking-wide leading-none",
        "rounded-full border",
        variantClasses[variant],
        className,
      )}
    >
      {showDot && (
        <span className={cn("status-dot", dotColors[variant], pulse && "pulsing")} />
      )}
      {children}
    </span>
  );
}

/**
 * Filter Chip — toggleable pill filter.
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
        "px-4 py-1.5 text-[11px] font-bold tracking-wide leading-none",
        "rounded-full border cursor-pointer transition-all duration-150 press",
        active
          ? "bg-[linear-gradient(120deg,var(--accent-primary),var(--accent-primary-deep))] text-[#fffdf9] border-transparent shadow-md"
          : "bg-surface text-fg-secondary border-border hover:text-fg hover:border-border-strong",
        className,
      )}
    >
      {children}
    </button>
  );
}
