import connectToDatabase from "@/lib/db";
import { UserDocument } from "@/lib/types";
import { getUserSession } from "../(auth)/_lib/session";
import { getGuestSessionId } from "@/app/(auth)/_lib/session";
import SessionExpiredNotification from "@/components/session-expired-notification";
import { GuestWelcomeNotification } from "@/components/guest-welcome-notification";

type Props = {
  searchParams: Promise<{ v?: string }>;
};

export async function generateMetadata({ searchParams }: Props) {
  const sp = await searchParams;

  let title = "Devlinks | Link Sharing for Developers";
  let description = "Share all your social links and profiles in one place with devlinks.";

  if (sp.v === "links") {
    title = "Devlinks | Links";
    description = "Manage your links";
  } else if (sp.v === "details") {
    title = "Devlinks | Profile Details";
    description = "Edit your profile details";
  }

  return {
    title,
    description,
  };
}

export default async function HomePage() {
  const status = await getGuestNotificationStatus();
  return (
    <>
      <GuestWelcomeNotification status={status} />
      <SessionExpiredNotification getUserSession={getUserSession()} />
    </>
  );
}

async function getGuestNotificationStatus(): Promise<
  "should-show" | "already-notified" | "no-guest"
> {
  const guestSessionId = await getGuestSessionId();
  if (!guestSessionId) return "no-guest";

  const { db } = await connectToDatabase();
  const collection = db.collection<UserDocument>("users");

  const guestUser = await collection.findOne({
    guestSessionId,
    registered: false,
  });

  if (!guestUser) return "no-guest";

  return guestUser.isNotified === true ? "already-notified" : "should-show";
}
