import { memo, startTransition, useMemo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import DNDIcon from "public/assets/images/icon-drag-and-drop.svg";

import { cn } from "@/lib/utils";
import { useLinks } from "../../contexts/links-context";
import { Link, PlatformKey, PlatformNames } from "@/lib/types";

import { LinkURL } from "./link-url";
import { Card } from "@/components/ui/card";
import { LinkPlatform } from "./link-platform";
import { Button } from "@/components/ui/button";
import { AnimatedTrashBin } from "@/components/icons/animated-trashbin";

type LinkItemProps = {
  link: Link;
  shouldHighlight?: boolean;
};

const areEqual = (
  { link, shouldHighlight }: LinkItemProps,
  { link: nextLink, shouldHighlight: nextLinkShouldHighlight }: LinkItemProps,
) => {
  return (
    link.id === nextLink.id &&
    link.platform === nextLink.platform &&
    link.order === nextLink.order &&
    link.url === nextLink.url &&
    shouldHighlight === nextLinkShouldHighlight
  );
};

const LinkItemComponent = ({
  link: { id, platform, url, order, createdAt },
  shouldHighlight = false,
}: LinkItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const [selectedPlatform, setSelectedPlatform] = useState(platform);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteLink } = useLinks();

  const parentStyles = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition: transition || undefined,
      opacity: isDragging ? "0.4" : "1",
      boxShadow: isDragging ? "0 6px 6px rgba(0, 0, 0, 0.1)" : "none",
    }),
    [transform, transition, isDragging],
  );

  const handleDelete = () => {
    setIsDeleting(true);
    try {
      startTransition(() => {
        deleteLink(id);
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatedTime = createdAt
    ? new Date(createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    : "";

  return (
    <Card
      ref={setNodeRef}
      style={parentStyles}
      aria-invalid={shouldHighlight}
      title={"Created on " + formatedTime}
      className={cn(
        "bg-background min-h-57 gap-3 p-5 transition duration-100",
        isDeleting ? "pointer-events-none opacity-60" : "",
      )}
    >
      {/* Warning banner for highlighted links */}
      {shouldHighlight && (
        <div className="border-destructive/50 mb-2 flex items-center gap-2 self-start rounded-md border bg-red-100 px-3 py-2 shadow">
          <div className="bg-destructive h-2 w-2 animate-pulse rounded-full"></div>
          <span className="text-sm font-medium text-amber-700">This link is missing a URL</span>
        </div>
      )}

      <header className="flex h-6 items-center justify-between">
        <div className="flex w-full items-center gap-1">
          <button
            type="button"
            className="hover:bg-border/25 grid size-6 cursor-grab touch-none place-items-center rounded active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <span className="sr-only">Drag and drop to reorder links</span>
            <DNDIcon className="fill-accent-foreground" />
          </button>
          <span className="text-accent-foreground pointer-events-none touch-none font-bold select-none">
            Link #{order}
          </span>
        </div>
        <div className="flex w-full justify-end">
          <Button
            size="icon"
            variant="ghost"
            disabled={isDeleting}
            onClick={handleDelete}
            className="w-fit select-none"
          >
            {isDeleting ? <AnimatedTrashBin /> : "Remove"}
          </Button>
        </div>
      </header>
      <div className="grid gap-3">
        <LinkPlatform
          id={id}
          platform={selectedPlatform as PlatformNames}
          onPlatformChange={setSelectedPlatform}
        />
        <LinkURL
          id={id}
          url={url}
          platform={platform as PlatformKey}
          selectedPlatform={selectedPlatform as PlatformNames}
          shouldHighlight={shouldHighlight}
        />
        <input type="hidden" form="links-form" name={`order-${id}`} value={order} />
      </div>
    </Card>
  );
};

export const LinkItem = memo(LinkItemComponent, areEqual);

LinkItem.displayName = "LinkItem";
