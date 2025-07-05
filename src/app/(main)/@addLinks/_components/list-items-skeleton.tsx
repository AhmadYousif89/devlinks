import { Skeleton } from "@/components/ui/skeleton";

export const ListItemSkeleton = ({ dataLength }: { dataLength: number }) => {
  return (
    <ul className="flex max-h-[777px] flex-col gap-6 overflow-y-auto">
      {Array.from({ length: dataLength }).map((_, index) => (
        <Skeleton role="listitem" key={index} className="h-57 gap-3 p-5">
          <header className="mb-6 flex h-6 items-center justify-between">
            <div className="flex w-full items-center gap-3">
              <Skeleton className="bg-foreground/10 size-5 rounded" />
              <Skeleton className="bg-foreground/10 h-4 w-16" />
            </div>
            <div className="flex w-full justify-end">
              <Skeleton className="bg-foreground/10 h-3 w-16 rounded" />
            </div>
          </header>

          <div className="grid gap-3">
            <div className="space-y-3">
              <Skeleton className="bg-foreground/10 h-2 w-16" />
              <Skeleton className="bg-foreground/10 h-10 w-full rounded-md" />
            </div>

            <div className="space-y-3">
              <Skeleton className="bg-foreground/10 h-2 w-8" />
              <Skeleton className="bg-foreground/10 h-10 w-full rounded-r-md" />
            </div>
          </div>
        </Skeleton>
      ))}
    </ul>
  );
};
