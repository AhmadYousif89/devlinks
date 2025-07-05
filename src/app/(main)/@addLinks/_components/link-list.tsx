"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useMemo } from "react";

import {
  closestCenter,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { Link } from "@/lib/types";
import { LinkItem } from "./link-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HighlightBanner } from "@/components/highlight-banner";
import { useLinks } from "../../contexts/links-context";
import { WelcomeCard } from "@/components/welcome-card";
import { useSearchParams } from "next/navigation";

const DNDContext = dynamic(() => import("@dnd-kit/core").then((mod) => mod.DndContext), {
  ssr: false,
});

export const LinkList = () => {
  const [activeItem, setActiveItem] = useState<Link | undefined>();
  const { links, optimisticLinks, setActualLinks } = useLinks();
  const searchParams = useSearchParams();

  const highlightFaultyLinks = useMemo(
    () => searchParams.get("highlight-links")?.split(",") || [],
    [searchParams],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 50, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeLink = links.find((item) => item.id === active.id);
      setActiveItem(activeLink);
    },
    [links],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveItem(undefined);
      if (!over || active.id === over.id) return;

      setActualLinks((currentLinks) => {
        const activeIdx = currentLinks.findIndex((item) => item.id === active.id);
        const overIdx = currentLinks.findIndex((item) => item.id === over.id);

        if (activeIdx !== overIdx) {
          const newLinks = arrayMove(currentLinks, activeIdx, overIdx);
          const updatedLinks = newLinks.map((link, index) => ({
            ...link,
            order: index + 1,
          }));
          return updatedLinks;
        }

        return currentLinks;
      });
    },
    [setActualLinks],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(undefined);
  }, []);

  if (optimisticLinks.length === 0) return <WelcomeCard />;

  return (
    <>
      {highlightFaultyLinks && highlightFaultyLinks.length > 0 && (
        <HighlightBanner
          area="LINKS"
          title="Links Missing URLs"
          description={`${highlightFaultyLinks.length} link${highlightFaultyLinks.length > 1 ? "s are" : " is"} missing URLs`}
        />
      )}
      <ScrollArea className="max-h-[777px] overscroll-contain">
        <DNDContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={optimisticLinks.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-6">
              {optimisticLinks.map((link) => (
                <li key={link.id}>
                  <LinkItem
                    link={link}
                    shouldHighlight={!link.url && highlightFaultyLinks?.includes(link.id)}
                  />
                </li>
              ))}
            </ul>
          </SortableContext>
          <DragOverlay
            transition={"transform 100ms ease"}
            style={{ transformOrigin: "center", willChange: "transform" }}
          >
            {activeItem ? (
              <LinkItem
                link={activeItem}
                shouldHighlight={!activeItem.url && highlightFaultyLinks?.includes(activeItem.id)}
              />
            ) : null}
          </DragOverlay>
        </DNDContext>
      </ScrollArea>
    </>
  );
};
