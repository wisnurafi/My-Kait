import { cn } from "@/lib/utils";

/**
 * RawBlock Spinner — square, no radius, thick border.
 */
export function Spinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <span
      className={cn(
        "inline-block animate-spin border-2 border-current border-t-transparent",
        sizes[size],
        className,
      )}
    />
  );
}
