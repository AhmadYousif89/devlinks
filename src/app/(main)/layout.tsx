import { Suspense } from "react";

import Wrapper from "./wrapper";
import { MainHeader } from "@/components/layout/header";

type MainLayoutProps = {
  addLinks: React.ReactNode;
  profileDetails: React.ReactNode;
  sidePanel?: React.ReactNode;
  children: React.ReactNode;
};

export default function MainLayout({
  addLinks,
  profileDetails,
  sidePanel,
  children,
}: MainLayoutProps) {
  return (
    <>
      <MainHeader />
      <Suspense fallback={<div className="bg-muted/15 m-4 h-full animate-pulse rounded-xl" />}>
        <Wrapper
          slots={{
            links: addLinks,
            details: profileDetails,
            sidePanel: sidePanel,
          }}
        >
          {children}
        </Wrapper>
      </Suspense>
    </>
  );
}
