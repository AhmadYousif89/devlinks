"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import LogoSmall from "public/assets/images/logo-devlinks-small.svg";
import PreviewIcon from "public/assets/images/icon-preview-header.svg";

import { TabButtons } from "./tab-btns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const MainHeader = () => {
  const searchParams = useSearchParams();

  const buildLogoURL = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("v");
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : "/";
  };

  const buildPreviewURL = () => {
    const params = new URLSearchParams(searchParams.toString());
    const queryString = params.toString();
    return queryString ? `/preview?${queryString}` : "/preview";
  };

  return (
    <header className="md:p-6">
      <Card className="py-4 pr-4 pl-6">
        <nav className="flex items-center justify-between px-0">
          <Link href={buildLogoURL()}>
            <LogoSmall className="md:hidden" />
            <Image
              width={146}
              height={32}
              alt="DevLinks Logo"
              src="/assets/images/logo-devlinks-large.svg"
              className="hidden md:block"
            />
          </Link>
          <TabButtons />
          <Button
            asChild
            size="icon"
            variant="secondary"
            className="h-10.5 w-13 md:h-11.5 md:w-28.5"
          >
            <Link href={buildPreviewURL()} className="flex size-full items-center justify-center">
              <PreviewIcon className="size-fit md:hidden" />
              <span className="hidden text-base md:block">Preview</span>
            </Link>
          </Button>
        </nav>
      </Card>
    </header>
  );
};
