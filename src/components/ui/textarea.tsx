/**
 * Textarea — sunken fill, 1px ink border, lime focus ring.
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
        "w-full px-4 py-3 rounded-lg",
        "bg-surface-input text-fg text-[15px]",
        "border border-border-ink shadow-sm",
        "hover:border-border-strong",
        "focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-primary-soft)]",
        "transition-colors duration-150 resize-y",
        "placeholder:text-fg-tertiary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
