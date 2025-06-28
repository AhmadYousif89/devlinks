import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

import LogoSmall from "public/assets/images/logo-devlinks-small.svg";
import PreviewIcon from "public/assets/images/icon-preview-header.svg";

import { TabButtons } from "./tab-btns";
import { Skeleton } from "../ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const MainHeader = () => {
  return (
    <header className="md:p-6">
      <Card className="py-4 pr-4 pl-6">
        <nav className="flex items-center justify-between px-0">
          <Link href="/">
            <LogoSmall className="md:hidden" />
            <Image
              width={146}
              height={32}
              alt="DevLinks Logo"
              src="/assets/images/logo-devlinks-large.svg"
              className="hidden md:block"
            />
          </Link>
          <Suspense
            fallback={
              <div className="flex items-center gap-1">
                <Skeleton className="h-10.5 w-18.5 rounded-sm md:h-11.5 md:w-28.5" />
                <Skeleton className="h-10.5 w-18.5 rounded-sm md:h-11.5 md:w-28.5" />
              </div>
            }
          >
            <TabButtons />
          </Suspense>
          <Button
            asChild
            size="icon"
            variant="secondary"
            className="h-10.5 w-13 md:h-11.5 md:w-28.5"
          >
            <Link
              href="/preview"
              className="flex size-full items-center justify-center"
            >
              <PreviewIcon className="size-fit md:hidden" />
              <span className="hidden md:block">Preview</span>
            </Link>
          </Button>
        </nav>
      </Card>
    </header>
  );
};
