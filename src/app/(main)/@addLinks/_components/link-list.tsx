"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";

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

const DNDContext = dynamic(() => import("@dnd-kit/core").then((mod) => mod.DndContext), {
  ssr: false,
});

type LinkListProps = {
  links: Link[];
};

export const LinkList = ({ links }: LinkListProps) => {
  const [dataLinks, setDataLinks] = useState(links);
  const [activeItem, setActiveItem] = useState<Link | undefined>();

  useEffect(() => {
    setDataLinks(links);
  }, [links]);

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

      const activeIdx = dataLinks.findIndex((item) => item.id === active.id);
      const overIdx = dataLinks.findIndex((item) => item.id === over.id);

      if (activeIdx !== overIdx) {
        const newLinks = arrayMove(dataLinks, activeIdx, overIdx);

        const updatedLinks = newLinks.map((link, index) => ({
          ...link,
          order: index + 1,
        }));

        setDataLinks(updatedLinks);
      }
    },
    [dataLinks],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(undefined);
  }, []);

  return (
    <ScrollArea className="max-h-[777px]">
      <DNDContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={dataLinks.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-6">
            {dataLinks.map((link) => (
              <li key={link.id}>
                <LinkItem {...link} />
              </li>
            ))}
          </ul>
        </SortableContext>
        <DragOverlay
          adjustScale
          transition={"transform 50ms ease"}
          style={{ transformOrigin: "center", willChange: "transform" }}
        >
          {activeItem ? <LinkItem {...activeItem} /> : null}
        </DragOverlay>
      </DNDContext>
    </ScrollArea>
  );
};
