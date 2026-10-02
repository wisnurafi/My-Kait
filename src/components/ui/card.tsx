/**
 * RawBlock Card — bold border, no shadow, no radius.
 * Visual hierarchy through border weight only.
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
        "bg-surface",
        elevated ? "border-[5px]" : "border-[3px]",
        "border-border-ink",
        hover && "transition-colors duration-100 hover:bg-sunken",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 border-b-[1px] border-border-ink", className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 border-t-[1px] border-border-ink", className)}>{children}</div>;
}
