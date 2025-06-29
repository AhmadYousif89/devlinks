import SessionExpiredNotification from "@/components/session-expired-notification";
import { getUserSession } from "../(auth)/_lib/session";

type Props = {
  searchParams: Promise<{ v?: string }>;
};

export async function generateMetadata({ searchParams }: Props) {
  const sp = await searchParams;

  let title = "Devlinks | Home";
  let description = "Home page";

  if (sp.v === "links") {
    title = "Devlinks | Links";
    description = "Manage your links";
  } else if (sp.v === "details") {
    title = "Devlinks | Profile Details";
    description = "Edit your profile details";
  } else {
    title = "Devlinks";
    description = "Home page";
  }

  return {
    title,
    description,
  };
}

export default async function HomePage() {
  return <SessionExpiredNotification getUserSession={getUserSession()} />;
}

export const dynamic = "force-dynamic";
