import { getLinksFromDB } from "./@addLinks/page";
import { LinksProvider } from "./contexts/links-context";
import { MainHeader } from "@/components/layout/header";
import Wrapper from "./wrapper";

type MainLayoutProps = {
  addLinks: React.ReactNode;
  profileDetails: React.ReactNode;
  sidePanel?: React.ReactNode;
  children: React.ReactNode;
};

export default async function MainLayout({
  addLinks,
  profileDetails,
  sidePanel,
  children,
}: MainLayoutProps) {
  const links = await getLinksFromDB();

  return (
    <LinksProvider initialLinks={links}>
      <MainHeader />
      <Wrapper
        slots={{
          links: addLinks,
          details: profileDetails,
          sidePanel: sidePanel,
        }}
      >
        {children}
      </Wrapper>
    </LinksProvider>
  );
}
