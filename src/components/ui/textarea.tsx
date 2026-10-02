/**
 * Neon Glass Textarea — dark glass fill, rounded, blurple focus glow.
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
        "w-full px-4 py-3 rounded-xl",
        "bg-surface-input text-fg font-mono text-[15px]",
        "border border-border-ink backdrop-blur-md",
        "hover:border-border-strong",
        "focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(88,101,242,0.25)]",
        "transition-all duration-150 resize-y",
        "placeholder:text-fg-tertiary placeholder:font-body",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
