/**
 * Cozy Button — warm sage primary, soft terracotta destructive.
 * Rounded, gentle shadows. GPU-only micro-interactions.
 */
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  // Sage green fill, cream text, soft shadow. Hover: lift + deepen.
  primary:
    "text-[#2d2a26] border-transparent bg-[linear-gradient(135deg,var(--accent-primary),var(--accent-primary-deep))] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(122,158,126,0.35)] hover:brightness-105",
  // Warm surface, soft border. Hover: lift + warm tint.
  secondary:
    "bg-surface text-fg border-border hover:bg-surface-hover hover:border-border-strong hover:-translate-y-0.5 hover:shadow-md",
  // Transparent, subtle. Hover: sage text + soft bg.
  ghost:
    "bg-transparent text-fg-secondary border-transparent hover:text-accent-deep hover:bg-accent-soft",
  // Soft terracotta. Hover: lift + soft shadow.
  destructive:
    "text-[#fffdf9] border-transparent bg-[linear-gradient(135deg,var(--accent-secondary),var(--accent-secondary-deep))] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(217,142,115,0.35)] hover:brightness-105",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-xs rounded-xl",
  md: "h-11 px-6 text-sm rounded-2xl",
  lg: "h-14 px-10 text-base rounded-2xl",
  icon: "h-10 w-10 text-sm rounded-2xl",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-bold",
          "font-display cursor-pointer select-none border",
          "transition-all duration-150 ease-out press shadow-sm",
          "disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 disabled:hover:shadow-none",
          "focus-ring",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
