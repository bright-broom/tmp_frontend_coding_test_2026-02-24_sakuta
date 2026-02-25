'use client';

import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton = memo(function Skeleton({
  className = '',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
});

export const BuildingCardSkeleton = memo(function BuildingCardSkeleton() {
  return (
    <div className="mx-4 py-4 border-b border-[#E0E0E0]" aria-hidden="true">
      <div className="mb-1">
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-y-1.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="contents">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
});

export const BuildingListSkeleton = memo(function BuildingListSkeleton({
  count = 5,
}: {
  count?: number;
}) {
  return (
    <div role="status" aria-label="読み込み中">
      <span className="sr-only">建物リストを読み込み中...</span>
      {[...Array(count)].map((_, i) => (
        <BuildingCardSkeleton key={i} />
      ))}
    </div>
  );
});

export const ChartSkeleton = memo(function ChartSkeleton() {
  return (
    <div className="h-full w-full flex flex-col" aria-hidden="true">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex-1 relative">
        <Skeleton className="absolute inset-0 rounded-lg" />
      </div>
    </div>
  );
});
