/**
 * Cozy Label — Nunito bold, sentence case, warm.
 */
import { cn } from "@/lib/utils";

export function Label({
  children,
  htmlFor,
  className,
  required,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block font-display font-bold text-[14px] mb-1.5 text-fg",
        className,
      )}
    >
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}
