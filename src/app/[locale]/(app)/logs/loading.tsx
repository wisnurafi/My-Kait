import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function LogsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-40" />
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 flex-1 min-w-[200px] rounded-xl" />
      </div>
      <SkeletonTable rows={8} />
    </div>
  );
}
