import React from "react";
import { cn } from "../../utils/cn.js";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />
  );
};

// Pre-built skeleton variants
export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl border p-4 space-y-3">
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-2 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl border overflow-hidden">
    <div className="bg-gray-50 border-b px-4 py-3">
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="px-4 py-3 border-b last:border-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-60 hidden md:block" />
          <Skeleton className="h-2 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonStats: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);
