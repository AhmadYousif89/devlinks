import { Skeleton } from "@/components/ui/skeleton";

export const ProfileInfoSkeleton = () => {
  return (
    <div className="flex flex-col items-center gap-3.25">
      <Skeleton className="bg-border h-4 w-40 rounded-full" />
      <Skeleton className="bg-border h-2 w-18 rounded-full" />
    </div>
  );
};
