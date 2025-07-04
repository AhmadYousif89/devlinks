import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const MainSkeletonWrapper = () => {
  return (
    <main
      className={cn(
        "@container flex flex-1 p-4 md:p-6 md:pt-0",
        "justify-between gap-4 *:basis-full md:gap-6",
      )}
    >
      {/* Side panel skeleton */}
      <Skeleton className="bg-foreground/5 hidden max-w-[560px] place-items-center @3xl:grid">
        <Skeleton className="bg-foreground/5 h-[633px] w-[308px] !rounded-4xl" />
      </Skeleton>

      {/* Main content skeleton */}
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

          <Skeleton className="bg-foreground/5 flex flex-1 flex-col items-center justify-center gap-2 p-6 md:p-10">
            <Skeleton className="bg-foreground/5 mb-4 h-20 w-[125px]" />
            <Skeleton className="bg-foreground/5 mb-2 h-6 w-1/2" />
            <Skeleton className="bg-foreground/5 h-2 w-full" />
            <Skeleton className="bg-foreground/5 h-2 w-full" />
            <Skeleton className="bg-foreground/5 h-2 w-full" />
          </Skeleton>
        </div>
        {/* Footer skeleton */}
        <div className="flex justify-end border-t p-4 md:px-10 md:py-6">
          <Skeleton className="bg-foreground/5 h-11.5 w-full md:ml-auto md:w-22.75" />
        </div>
      </Skeleton>
    </main>
  );
};
