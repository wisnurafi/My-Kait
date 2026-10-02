import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function WebhooksLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-40" />
      <div className="glass p-5 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
