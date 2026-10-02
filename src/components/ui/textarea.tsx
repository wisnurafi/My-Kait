/**
 * RawBlock Textarea — sunken fill, thick border, Space Mono.
 */
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full px-3 py-2.5",
        "bg-sunken text-fg font-mono text-[15px]",
        "border-[3px] border-border-ink",
        "hover:bg-surface-hover",
        "focus:outline-none focus:border-[5px] focus:px-2.5 focus:py-2",
        "transition-colors duration-100 resize-none",
        "placeholder:text-fg-tertiary",
        "disabled:border-disabled disabled:bg-surface-input disabled:text-disabled-fg disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
