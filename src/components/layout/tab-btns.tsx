import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useOptimistic, startTransition } from "react";

import HeaderLinkIcon from "public/assets/images/icon-links-header.svg";
import ProfileDetailIcon from "public/assets/images/icon-profile-details-header.svg";

import { Button } from "../ui/button";

export const TabButtons = () => {
  const searchParams = useSearchParams();
  const [currentSlot, setCurrentSlot] = useOptimistic(searchParams.get("v") || "links");

  const handleSlotTransition = (slot: string) => {
    startTransition(() => setCurrentSlot(slot));
  };

  const buildTabURL = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("v", tab);
    return `/?${params.toString()}`;
  };

  return (
    <div role="tablist" aria-label="Main navigation" className="flex gap-[2px] p-px">
      <Button
        asChild
        size="icon"
        variant="tab"
        id="links-tab"
        aria-controls="links-panel"
        aria-pressed={currentSlot === "links"}
        className="h-10.5 w-18.5 gap-2 md:h-11.5 md:w-fit md:px-6.75 md:py-2.75"
        onClick={() => handleSlotTransition("links")}
      >
        <Link href={buildTabURL("links")}>
          <HeaderLinkIcon className="size-fit" aria-hidden="true" />
          <span className="hidden text-base font-semibold md:inline-block">Links</span>
        </Link>
      </Button>
      <Button
        asChild
        size="icon"
        variant="tab"
        id="details-tab"
        aria-controls="details-panel"
        aria-pressed={currentSlot === "details"}
        className="h-10.5 w-18.5 gap-2 md:h-11.5 md:w-fit md:px-6.75 md:py-2.75"
        onClick={() => handleSlotTransition("details")}
      >
        <Link href={buildTabURL("details")}>
          <ProfileDetailIcon className="size-fit" aria-hidden="true" />
          <span className="hidden text-base font-semibold md:inline-block">Profile Details</span>
        </Link>
      </Button>
    </div>
  );
};
