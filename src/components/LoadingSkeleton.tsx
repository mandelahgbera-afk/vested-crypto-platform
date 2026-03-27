/**
 * Loading Skeleton Components
 * Smooth placeholder animations while content loads
 */

export function CardSkeleton() {
  return (
    <div className="bg-[#1A1F2E] rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-[#2A2F3E] rounded w-3/4 mb-3" />
      <div className="h-8 bg-[#2A2F3E] rounded w-1/2 mb-4" />
      <div className="h-4 bg-[#2A2F3E] rounded w-full mb-2" />
      <div className="h-4 bg-[#2A2F3E] rounded w-5/6" />
    </div>
  );
}

export function BalanceSkeleton() {
  return (
    <div className="bg-[#1A1F2E] rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-[#2A2F3E] rounded w-1/4 mb-4" />
      <div className="h-10 bg-[#2A2F3E] rounded w-1/2 mb-4" />
      <div className="flex gap-2">
        <div className="h-8 bg-[#2A2F3E] rounded flex-1" />
        <div className="h-8 bg-[#2A2F3E] rounded flex-1" />
        <div className="h-8 bg-[#2A2F3E] rounded flex-1" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex gap-4 py-4 px-4 border-b border-[#2A2F3E] animate-pulse">
      <div className="h-6 bg-[#2A2F3E] rounded w-10" />
      <div className="h-6 bg-[#2A2F3E] rounded flex-1" />
      <div className="h-6 bg-[#2A2F3E] rounded w-20" />
      <div className="h-6 bg-[#2A2F3E] rounded w-24" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="bg-[#1A1F2E] rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-[#2A2F3E] rounded w-32" />
        <div className="h-6 bg-[#2A2F3E] rounded w-16" />
      </div>
      <div className="h-8 bg-[#2A2F3E] rounded w-1/3" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-[#1A1F2E] rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-[#2A2F3E] rounded w-1/4 mb-6" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-[#2A2F3E] rounded-t"
            style={{ height: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ cols = 3 }: { cols?: number }) {
  return (
    <div className={`grid grid-cols-${cols} gap-4`}>
      {Array.from({ length: cols }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
