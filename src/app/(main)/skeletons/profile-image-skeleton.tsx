import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { inPreviewPage?: boolean };

export const ProfileImageSkeleton = ({ inPreviewPage = false }: Props) => {
  return (
    <Skeleton className={cn("bg-accent rounded-full", inPreviewPage ? "size-26" : "size-24")} />
  );
};
