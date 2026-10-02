/**
 * Label — mono micro-label utility, block, optional required asterisk.
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
      className={cn("label block mb-1.5", className)}
    >
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}
