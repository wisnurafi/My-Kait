import { cn } from "@/lib/utils";

/**
 * RawBlock Skeleton — sunken fill, no radius, no shadow.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-sunken",
        className,
      )}
    />
  );
}

export function SkeletonRow() {
  return (
    <div className="p-4 flex items-center justify-between gap-3 border-b-[1px] border-border-ink">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="h-6 w-16" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
