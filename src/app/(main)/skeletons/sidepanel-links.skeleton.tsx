import { Skeleton } from "@/components/ui/skeleton";

export const SidePanelLinkSkeleton = () => {
  return (
    <ul className="col-end-1 row-end-1 flex flex-col gap-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index}>
          <Skeleton className="bg-border h-11 rounded-md" />
        </li>
      ))}
    </ul>
  );
};
