/**
 * Input — sunken fill, 1px ink border, lime focus ring.
 */
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full h-11 px-4 py-2.5 rounded-lg",
        "bg-surface-input text-fg text-[15px]",
        "border border-border-ink shadow-sm",
        "hover:border-border-strong",
        "focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-primary-soft)]",
        "transition-colors duration-150",
        "placeholder:text-fg-tertiary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
