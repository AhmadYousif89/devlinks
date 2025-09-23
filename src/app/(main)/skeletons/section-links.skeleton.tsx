import { Skeleton } from "@/components/ui/skeleton";
import { ListItemSkeleton } from "./list-items.skeleton";

export const SectionLinksSkeleton = ({ linksCount }: { linksCount: number }) => {
  return (
    <Skeleton className="bg-foreground/5 flex flex-col justify-between">
      <div className="flex basis-full flex-col p-6 md:p-10">
        <div className="mb-6">
          <div className="mb-10 flex flex-col gap-2">
            <Skeleton className="bg-foreground/5 mb-3 h-8 w-1/2" />
            <Skeleton className="bg-foreground/5 h-2 w-full" />
            <Skeleton className="bg-foreground/5 h-2 w-full" />
          </div>
          <Skeleton className="bg-foreground/5 h-11.5 w-full" />
        </div>

        {linksCount < 1 ? (
          <Skeleton className="bg-foreground/5 flex flex-1 flex-col items-center justify-center gap-2 p-6 md:p-10">
            <Skeleton className="bg-foreground/5 mb-4 h-20 w-[125px]" />
            <Skeleton className="bg-foreground/5 mb-2 h-6 w-1/2" />
            <Skeleton className="bg-foreground/5 h-2 w-full" />
            <Skeleton className="bg-foreground/5 h-2 w-full" />
            <Skeleton className="bg-foreground/5 h-2 w-full" />
          </Skeleton>
        ) : (
          <ListItemSkeleton count={linksCount} />
        )}
      </div>

      <div className="flex justify-end border-t p-4 md:px-10 md:py-6">
        <Skeleton className="bg-foreground/5 h-11.5 w-full md:ml-auto md:w-22.75" />
      </div>
    </Skeleton>
  );
};
