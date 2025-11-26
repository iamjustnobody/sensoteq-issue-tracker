import { Skeleton } from "../ui/Skeleton";

export const LoadFormModal: React.FC<any> = ({}) => {
  return (
    <div className="space-y-4">
      {/* Title skeleton */}
      <div>
        <div className="h-4 w-16 bg-gray-200 rounded mb-1 animate-pulse" />
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Description skeleton */}
      <div>
        <div className="h-4 w-20 bg-gray-200 rounded mb-1 animate-pulse" />
        <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Status skeleton */}
      <div>
        <div className="h-4 w-14 bg-gray-200 rounded mb-1 animate-pulse" />
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Progress skeleton */}
      <div>
        <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse" />
        <div className="h-6 w-full bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Buttons skeleton */}
      <div className="flex gap-3 pt-4">
        <div className="h-10 flex-1 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 flex-1 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};
export const LoadFormModalBasic: React.FC<any> = ({}) => {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-14 mb-1" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
};
