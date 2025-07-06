import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const SectionProfileSkeleton = () => {
  return (
    <>
      <div className="space-y-6 p-6 md:p-10">
        {/* Header skeleton */}
        <header className="mb-10 flex flex-col gap-2">
          <Skeleton className="bg-foreground/5 h-8 w-48" />
          <Skeleton className="bg-foreground/5 h-4 w-full" />
          <Skeleton className="bg-foreground/5 h-4 w-3/4" />
        </header>

        {/* Image field skeleton */}
        <div className="@container">
          <Card className="bg-background gap-4 p-5 @xl:flex-row @xl:items-center @xl:justify-between">
            <Skeleton className="bg-foreground/5 h-4 w-32 @xl:min-w-40" />
            <div className="flex flex-col gap-6 @xl:max-w-[432px] @xl:flex-row @xl:items-center">
              <Skeleton className="bg-foreground/5 rounded-12 size-[193px]" />
              <div className="space-y-2">
                <Skeleton className="bg-foreground/5 h-3 w-40" />
                <Skeleton className="bg-foreground/5 h-3 w-32" />
              </div>
            </div>
          </Card>
        </div>

        {/* Input fields skeleton */}
        <Card className="bg-background @container gap-3 p-5">
          {/* First name field */}
          <fieldset className="space-y-1 @xl:flex @xl:items-center @xl:justify-between @xl:gap-4 @xl:space-y-0">
            <Skeleton className="bg-foreground/5 h-4 w-20 @xl:min-w-40" />
            <div className="grid @xl:max-w-[432px] @xl:flex-1">
              <Skeleton className="bg-foreground/5 h-12 w-full rounded-md" />
            </div>
          </fieldset>

          {/* Last name field */}
          <fieldset className="space-y-1 @xl:flex @xl:items-center @xl:justify-between @xl:gap-4 @xl:space-y-0">
            <Skeleton className="bg-foreground/5 h-4 w-20 @xl:min-w-40" />
            <div className="grid @xl:max-w-[432px] @xl:flex-1">
              <Skeleton className="bg-foreground/5 h-12 w-full rounded-md" />
            </div>
          </fieldset>

          {/* Email field */}
          <fieldset className="space-y-1 @xl:flex @xl:items-center @xl:justify-between @xl:gap-4 @xl:space-y-0">
            <Skeleton className="bg-foreground/5 h-4 w-12 @xl:min-w-40" />
            <div className="grid @xl:max-w-[432px] @xl:flex-1">
              <Skeleton className="bg-foreground/5 h-12 w-full rounded-md" />
            </div>
          </fieldset>
        </Card>
      </div>

      {/* Save button skeleton */}
      <div className="border-border mt-auto flex items-center justify-center border-t p-4">
        <Skeleton className="bg-foreground/5 h-11.5 w-full md:ml-auto md:w-22.75" />
      </div>
    </>
  );
};
