export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-surface-2 ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <Skeleton className="mt-3 h-3 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/4" />
    </div>
  );
}
