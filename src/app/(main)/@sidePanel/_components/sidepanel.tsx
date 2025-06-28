import { Suspense } from "react";

import PhoneMockup from "public/assets/images/illustration-phone-mockup.svg";

import { Card } from "@/components/ui/card";
import { LinksPreview } from "../../components/links-preview";
import { LinksSkeleton } from "../../skeletons/links-skeleton";
import { ProfilePreview } from "../../components/profile-preview";
import { ScrollArea } from "@/components/ui/scroll-area";

export const SidePanel = async () => {
  return (
    <Card className="grid place-self-center overflow-hidden p-5 md:p-10">
      <PhoneMockup className="col-end-1 row-end-1" />
      <div className="col-end-1 row-end-1 flex h-full flex-col items-center gap-14 self-start pt-[63.5px] pr-[35.5px] pb-[56px] pl-[35.5px]">
        <ProfilePreview />
        <ScrollArea className="max-h-[300px] w-full">
          <div className="grid">
            <ul className="col-end-1 row-end-1 flex flex-col gap-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="bg-border/40 h-11 rounded-md" />
              ))}
            </ul>
            <Suspense fallback={<LinksSkeleton />}>
              <LinksPreview />
            </Suspense>
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
