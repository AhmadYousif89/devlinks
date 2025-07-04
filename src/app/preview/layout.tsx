import { getLinksFromDB } from "../(main)/@addLinks/page";
import { LinksProvider } from "../(main)/contexts/links-context";

type PreviewLayoutProps = {
  children: React.ReactNode;
};

export default async function PreviewLayout({ children }: PreviewLayoutProps) {
  const links = await getLinksFromDB();

  return <LinksProvider initialLinks={links}>{children}</LinksProvider>;
}
