import { Suspense } from "react";
import { getLinksFromDB } from "../(main)/@addLinks/page";
import { LinksProvider } from "../(main)/contexts/links-context";
import { PreviewPageSkeleton } from "./skeletons/preview.skeleton";

type PreviewLayoutProps = {
  children: React.ReactNode;
};

export default async function PreviewLayout({ children }: PreviewLayoutProps) {
  const links = await getLinksFromDB();

  return (
    <LinksProvider initialLinks={links}>
      <Suspense fallback={<PreviewPageSkeleton count={links.length} />}>{children}</Suspense>
    </LinksProvider>
  );
}
