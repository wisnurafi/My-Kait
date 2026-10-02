/**
 * RawBlock Input — sunken fill, thick border, Space Mono.
 * Focus: heavier border (5px). No radius, no shadow.
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
        "w-full h-11 px-3 py-2.5",
        "bg-sunken text-fg font-mono text-[15px]",
        "border-[3px] border-border-ink",
        "hover:bg-surface-hover",
        "focus:outline-none focus:border-[5px] focus:px-2.5 focus:py-2",
        "transition-colors duration-100",
        "placeholder:text-fg-tertiary",
        "disabled:border-disabled disabled:bg-surface-input disabled:text-disabled-fg disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
