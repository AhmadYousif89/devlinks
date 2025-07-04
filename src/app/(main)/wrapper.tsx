"use client";

import { useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Section } from "@/components/layout/section";

type Props = {
  children: React.ReactNode;
  slots: {
    details: React.ReactNode;
    links: React.ReactNode;
    sidePanel?: React.ReactNode;
  };
};

export default function Wrapper({ children, slots }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const minSwipeDistance = 50;
  const viewingSlot = searchParams.get("v");
  const { details, links, sidePanel } = slots;

  let content = links;

  if (viewingSlot === "details") {
    content = details;
  } else if (viewingSlot === "links") {
    content = links;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipeGesture();
  };

  const handleSwipeGesture = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = swipeDistance > minSwipeDistance;
    const isRightSwipe = swipeDistance < -minSwipeDistance;

    if (isLeftSwipe && (!viewingSlot || viewingSlot === "links")) {
      router.push("/?v=details");
    } else if (isRightSwipe && viewingSlot === "details") {
      router.push("/?v=links");
    }
  };

  return (
    <>
      {children}
      <main
        className={cn(
          "@container flex flex-1 p-4 md:p-6 md:pt-0",
          sidePanel ? "justify-between gap-4 *:basis-full md:gap-6" : "",
        )}
      >
        {sidePanel && (
          <aside className="bg-card rounded-12 hidden max-w-[560px] @3xl:grid">{sidePanel}</aside>
        )}
        <Section
          role="tabpanel"
          key={viewingSlot}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
          id={viewingSlot === "details" ? "details-panel" : "links-panel"}
          aria-labelledby={viewingSlot === "details" ? "details-tab" : "links-tab"}
        >
          {content}
        </Section>
      </main>
    </>
  );
}
