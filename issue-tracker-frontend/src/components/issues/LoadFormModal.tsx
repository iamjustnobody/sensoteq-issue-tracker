import { Skeleton } from "../ui/Skeleton";

export const LoadFormModal: React.FC<any> = ({}) => {
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
