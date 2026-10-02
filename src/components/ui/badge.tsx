/**
 * Neon Glass Badge — rounded pills with soft tinted backgrounds.
 * `pulse` adds a glowing pulse dot (great for "active" webhook status).
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
  default: "bg-surface-hover text-fg-secondary border-border-ink",
  active: "bg-[rgba(52,211,153,0.12)] text-success border-[rgba(52,211,153,0.35)]",
  success: "bg-[rgba(52,211,153,0.12)] text-success border-[rgba(52,211,153,0.35)]",
  warning: "bg-[rgba(251,191,36,0.12)] text-warning border-[rgba(251,191,36,0.35)]",
  danger: "bg-[rgba(251,113,133,0.12)] text-error border-[rgba(251,113,133,0.35)]",
  error: "bg-[rgba(251,113,133,0.12)] text-error border-[rgba(251,113,133,0.35)]",
  info: "bg-[rgba(88,101,242,0.14)] text-accent-bright border-[rgba(88,101,242,0.4)]",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-fg-tertiary",
  active: "bg-success",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-error",
  error: "bg-error",
  info: "bg-accent",
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
  /** Pulsing glow dot — use for live/active states */
  pulse?: boolean;
  /** Static status dot */
  dot?: boolean;
}) {
  const showDot = pulse || dot;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1",
        "text-[11px] font-bold uppercase tracking-[0.06em] leading-none",
        "rounded-full border backdrop-blur-sm",
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
        "px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] leading-none",
        "rounded-full border cursor-pointer transition-all duration-150 press",
        active
          ? "bg-[linear-gradient(120deg,var(--accent-primary),var(--accent-secondary))] text-white border-transparent shadow-[0_4px_16px_rgba(88,101,242,0.4)]"
          : "bg-surface text-fg-secondary border-border-ink hover:text-fg hover:border-border-strong",
        className,
      )}
    >
      {children}
    </button>
  );
}
