import { Skeleton } from "@/components/ui/skeleton";

export const PreviewPageSkeleton = ({ count }: { count: number }) => {
  return (
    <main className="bg-background rounded-b-12 relative isolate mb-6 flex flex-1 flex-col gap-15 md:gap-25.5">
      {/* Header skeleton */}
      <header className="md:p-6">
        <Skeleton className="bg-foreground/5 py-4 pr-4 pl-6">
          <nav className="flex items-center justify-between gap-4">
            <Skeleton className="bg-foreground/5 h-11.5 w-40" />
            <Skeleton className="bg-foreground/5 h-11.5 w-40" />
          </nav>
        </Skeleton>
      </header>

      {/* Background decoration skeleton */}
      <Skeleton className="bg-foreground/10 absolute inset-0 -z-10 hidden h-[357px] rounded-br-4xl rounded-bl-4xl md:block" />

      {/* Main content card skeleton */}
      <Skeleton className="bg-border flex min-w-87.25 flex-col items-center justify-center gap-14 self-center p-6 max-md:bg-transparent md:px-14 md:py-12">
        {/* Profile Preview skeleton */}
        <section className="flex flex-col items-center gap-6.25">
          {/* Profile image skeleton */}
          <Skeleton className="bg-foreground/5 size-26 rounded-full" />

          {/* Profile info skeleton */}
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="bg-foreground/10 h-8 w-48 rounded-full" />
            <Skeleton className="bg-foreground/10 h-4 w-32 rounded-full" />
          </div>
        </section>

        {/* Links Preview skeleton */}
        <div className="w-full max-w-[600px]">
          <ul className="col-end-1 row-end-1 flex max-h-[600px] w-full flex-col gap-5 overflow-y-auto">
            {Array.from({ length: count }).map((_, index) => (
              <li key={index}>
                <Skeleton className="bg-foreground/10 h-14 w-full rounded-md" />
              </li>
            ))}
          </ul>
        </div>
      </Skeleton>
    </main>
  );
};
