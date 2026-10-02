/**
 * RawBlock Select — sunken fill, thick border, Space Mono.
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
        "w-full h-11 px-3 py-2.5",
        "bg-sunken text-fg font-mono text-[15px]",
        "border-[3px] border-border-ink cursor-pointer",
        "hover:bg-surface-hover",
        "focus:outline-none focus:border-[5px] focus:px-2.5 focus:py-2",
        "transition-colors duration-100",
        "disabled:border-disabled disabled:bg-surface-input disabled:text-disabled-fg disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";
