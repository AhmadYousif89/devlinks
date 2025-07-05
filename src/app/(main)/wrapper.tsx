"use client";

import { Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Section } from "@/components/layout/section";
import { MainSkeletonWrapper } from "./skeletons/main-skeleton-wrapper";
import { useLinks } from "./contexts/links-context";

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
  const linksCount = useLinks().links.length;

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

    const params = new URLSearchParams(searchParams.toString());
    if (isLeftSwipe && (!viewingSlot || viewingSlot === "links")) {
      params.set("v", "details");
      router.push(`/?${params.toString()}`);
    } else if (isRightSwipe && viewingSlot === "details") {
      params.set("v", "links");
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <>
      {children}
      <Suspense fallback={<MainSkeletonWrapper linksCount={linksCount} />}>
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
      </Suspense>
    </>
  );
}
