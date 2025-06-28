import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-background rounded-12 animate-pulse", className)}
      {...props}
    />
  );
}

export { Skeleton };
