/**
 * Card — flat panel surface, 1px border, small radius.
 * Props kept compatible: hover (lift on hover), elevated (stronger border).
 */
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = false,
  elevated = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  elevated?: boolean;
}) {
  return (
    <div
      className={cn(
        "panel",
        // `.panel` is unlayered CSS so a normal utility can't override its
        // border-color; the trailing `!` (Tailwind v4 important) is required.
        elevated && "border-border-strong!",
        hover && "lift cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 border-b border-border-ink", className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 border-t border-border-ink", className)}>{children}</div>;
}
