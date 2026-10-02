import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function TemplatesLoading() {
  return (
    <div className="flex gap-8 flex-col lg:flex-row">
      {/* Folder sidebar skeleton */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="glass p-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full rounded-full" />
          <Skeleton className="h-9 w-full rounded-full" />
          <Skeleton className="h-9 w-3/4 rounded-full" />
        </div>
      </aside>
      {/* Cards grid skeleton */}
      <div className="flex-1 min-w-0 space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
