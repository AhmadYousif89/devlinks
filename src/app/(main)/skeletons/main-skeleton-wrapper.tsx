import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionLinksSkeleton } from "./section-links-skeleton";

export const MainSkeletonWrapper = ({ linksCount }: { linksCount: number }) => {
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

      <SectionLinksSkeleton linksCount={linksCount} />
    </main>
  );
};
