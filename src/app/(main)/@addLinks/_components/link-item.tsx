import { startTransition, memo, useMemo, useState } from "react";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import DNDIcon from "public/assets/images/icon-drag-and-drop.svg";

import { Link, PlatformKey, PlatformNames } from "@/lib/types";
import { deleteLink } from "@/app/(main)/actions/links";

import { LinkURL } from "./link-url";
import { LinkPlatform } from "./link-platform";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedTrashBin } from "@/components/icons/animated-trashbin";

type LinkItemProps = {} & Link;

const areEqual = (prevProps: LinkItemProps, nextProps: LinkItemProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.platform === nextProps.platform &&
    prevProps.order === nextProps.order &&
    prevProps.url === nextProps.url
  );
};

const LinkItemComponent = ({ id, platform, order, url, createdAt }: LinkItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(platform);

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
    startTransition(async () => {
      try {
        await deleteLink(id);
      } catch (error) {
        console.error("Error deleting link:", error);
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const formatedTime = createdAt
    ? new Date(createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Card
      className="bg-background min-h-57 gap-3 p-5"
      title={"Created on " + formatedTime}
      style={parentStyles}
      ref={setNodeRef}
    >
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
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
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
        />
        <input type="hidden" form="links-form" name={`order-${id}`} value={order} />
      </div>
    </Card>
  );
};

export const LinkItem = memo(LinkItemComponent, areEqual);

LinkItem.displayName = "LinkItem";
