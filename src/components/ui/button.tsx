/**
 * RawBlock Button — brutalist, no radius, no shadow.
 * Thick borders, uppercase tracking, full color inversion on hover.
 * Active state uses heavier border.
 */
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  // Black fill, white text. Hover: full inversion (white bg, black text).
  primary:
    "bg-fg text-bg border-fg hover:bg-surface hover:text-fg",
  // White fill, black text. Hover: full inversion (black bg, white text).
  secondary:
    "bg-surface text-fg border-fg hover:bg-fg hover:text-bg",
  // Transparent, no border, underline. Hover: text blue.
  ghost:
    "bg-transparent text-fg border-transparent underline underline-offset-2 hover:text-link",
  // Error fill, white text. Hover: black bg, error text.
  destructive:
    "bg-error text-white border-fg hover:bg-fg hover:text-error",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-10 text-lg",
  icon: "h-10 w-10 text-sm",
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
          "uppercase tracking-[0.05em] cursor-pointer select-none",
          "border-[3px] transition-colors duration-100",
          "active:border-[5px]",
          "disabled:bg-disabled-bg disabled:text-disabled-fg disabled:border-disabled disabled:cursor-not-allowed disabled:active:border-[3px]",
          "focus-ring",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
