import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { Card } from "@/components/ui/card";

import { getUserById, getUserLinks } from "../actions/preview";
import { UserPublicLinks } from "./_components/public-user-links";
import { UserPublicProfile } from "./_components/public-user-profile";

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  return {
    title: `Devlinks | ${username}`,
    description: `View ${username}'s public profile.`,
  };
}

export default async function userPublicPreviewPage({ searchParams }: PageProps) {
  const { id } = await searchParams;

  if (!id) redirect("/");

  const user = await getUserById(id);

  if (!user) notFound();

  const links = await getUserLinks(id);

  return (
    <main className="bg-card rounded-b-12 relative isolate mb-6 flex flex-1 flex-col gap-15 md:gap-25.5">
      <header className="md:p-6">
        <Card className="py-4 pr-4 pl-6">
          <Link href="/" className="w-fit">
            <Image
              width={146}
              height={32}
              alt="DevLinks Logo"
              src="/assets/images/logo-devlinks-large.svg"
            />
          </Link>
        </Card>
      </header>

      <div className="bg-primary absolute inset-0 -z-10 hidden h-[357px] rounded-br-4xl rounded-bl-4xl md:block" />

      <Card className="flex min-w-87.25 flex-col items-center justify-center gap-14 self-center p-6 max-md:bg-transparent md:px-14 md:py-12 md:drop-shadow-xl">
        <UserPublicProfile user={user} />
        <UserPublicLinks links={links} />
      </Card>
    </main>
  );
}
