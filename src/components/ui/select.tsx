/**
 * Neon Glass Select — dark glass fill, rounded, blurple focus glow.
 */
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full h-11 px-4 py-2.5 rounded-xl",
        "bg-surface-input text-fg font-mono text-[15px]",
        "border border-border-ink backdrop-blur-md cursor-pointer",
        "hover:border-border-strong",
        "focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(88,101,242,0.25)]",
        "transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";
