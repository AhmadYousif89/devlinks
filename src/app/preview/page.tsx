import { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";

import { ShareLink } from "./share-link";
import { GuestSharePrompt } from "./guest-share-prompt";
import { getLinksCount } from "@/app/(main)/@addLinks/page";
import { getUserFromSession } from "@/app/(auth)/_lib/session";
import { LinksPreview } from "@/app/(main)/components/links-preview";
import { ProfilePreview } from "@/app/(main)/components/profile-preview";
import { BackToEditor } from "./back-to-editor";

export const metadata: Metadata = {
  title: "Devlinks | Preview",
  description: "Preview your links before sharing them with the world.",
};

export default async function PreviewPage() {
  const user = await getUserFromSession();
  const count = await getLinksCount();

  if (!user && count < 1) {
    redirect("/signin");
  }

  return (
    <main className="bg-card rounded-b-12 relative isolate mb-6 flex flex-1 flex-col gap-15 md:gap-25.5">
      <header className="md:p-6">
        <Card className="py-4 pr-4 pl-6">
          <nav className="flex items-center justify-between gap-4">
            <BackToEditor />

            {user ? <ShareLink user={user} /> : <GuestSharePrompt />}
          </nav>
        </Card>
      </header>

      <div className="bg-primary absolute inset-0 -z-10 hidden h-[357px] rounded-br-4xl rounded-bl-4xl md:block" />

      <Card className="flex min-w-87.25 flex-col items-center justify-center gap-14 self-center p-6 max-md:bg-transparent md:px-14 md:py-12 md:drop-shadow-xl">
        <ProfilePreview inPreviewPage={true} />
        <LinksPreview inPreviewPage={true} />
      </Card>
    </main>
  );
}
