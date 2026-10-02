/**
 * RawBlock Label — Archivo Black, uppercase, bold.
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
        "block font-display text-[14px] uppercase mb-1",
        className,
      )}
    >
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}
