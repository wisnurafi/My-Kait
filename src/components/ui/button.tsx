/**
 * Neon Glass Button — gradient primary with glow, glass secondary.
 * GPU-only micro-interactions (translate/scale/brightness).
 */
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  // Blurple→cyan gradient, white text, glow. Hover: lift + brighter glow.
  primary:
    "text-white border-transparent bg-[linear-gradient(120deg,var(--accent-primary),#4a5ae0_55%,var(--accent-secondary))] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(88,101,242,0.5)]",
  // Glass fill. Hover: border glow + lift.
  secondary:
    "bg-surface text-fg border-border-ink backdrop-blur-md hover:bg-surface-hover hover:border-border-strong hover:-translate-y-0.5",
  // Transparent, subtle. Hover: accent text + surface.
  ghost:
    "bg-transparent text-fg-secondary border-transparent hover:text-fg hover:bg-surface-hover",
  // Rose gradient. Hover: lift + glow.
  destructive:
    "text-white border-transparent bg-[linear-gradient(120deg,#f43f5e,#e11d48)] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(244,63,94,0.45)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-xs rounded-lg",
  md: "h-11 px-6 text-sm rounded-xl",
  lg: "h-14 px-10 text-base rounded-xl",
  icon: "h-10 w-10 text-sm rounded-xl",
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
          "tracking-wide cursor-pointer select-none border",
          "transition-all duration-150 ease-out press",
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
