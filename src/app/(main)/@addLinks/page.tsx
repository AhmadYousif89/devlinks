import { Suspense } from "react";

import { cache } from "@/lib/cache";
import connectToDatabase from "@/lib/db";
import { LinkDocument } from "@/lib/types";
import { createNewLink } from "./_actions/create";
import { getProfileData } from "../@profileDetails/_dal/read.dal";
import { getUserFromSession, getUserSession } from "@/app/(auth)/_lib/session";

import { Spinner } from "@/components/icons/spinner";
import { ButtonWithFormState } from "@/components/button-with-formstate";
import { LinksFormWrapper } from "./_components/links-form-wrapper";
import { ListItemSkeleton } from "../skeletons/list-items.skeleton";
import { LinkList } from "./_components/link-list";

export default async function AddLinksSlot() {
  const count = await getLinksCount();
  const session = await getUserSession();

  return (
    <>
      <div className="flex basis-full flex-col p-6 md:p-10">
        <div className="mb-6">
          <header className="mb-10 flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Customize your links</h2>
            <p className="text-accent-foreground">
              Add/edit/remove links below and then share all your profiles with the world!
            </p>
          </header>
          <form action={createNewLink} className="h-11.5">
            <ButtonWithFormState
              variant="secondary"
              disabled={session?.expired}
              className="h-11.5 w-full text-base font-semibold"
              actionLoader={<Spinner className="fill-primary size-6" />}
            >
              + Add new link
            </ButtonWithFormState>
          </form>
        </div>
        <div className="flex basis-full flex-col">
          <Suspense fallback={<ListItemSkeleton count={count} />}>
            <LinkList />
          </Suspense>
        </div>
      </div>
      <LinksFormWrapper
        formId="links-form"
        className="border-border flex items-center justify-center border-t p-4 md:px-10 md:py-6"
      >
        <ButtonWithFormState
          type="submit"
          disabled={count < 1 || session?.expired}
          actionLoader={<Spinner className="size-8" />}
          className="h-11.5 w-full text-base font-semibold md:ml-auto md:w-22.75"
        >
          Save
        </ButtonWithFormState>
      </LinksFormWrapper>
    </>
  );
}

// Public function that extracts dynamic data and calls the cached function
export async function getLinksFromDB() {
  const user = await getUserFromSession();
  const userId = user?.id;
  if (userId) return _getCachedLinksFromDB(userId);
  else {
    const profileData = await getProfileData();
    return profileData?.links || [];
  }
}

// Make cached function pure - only depends on parameters
const _getCachedLinksFromDB = cache(
  async (userId: string) => {
    const { db } = await connectToDatabase();
    const collection = db.collection<LinkDocument>("links");

    try {
      const links = await collection.find({ userId }).sort({ order: 1 }).toArray();

      return links.map((link) => ({
        id: link._id.toString(),
        platform: link.platform,
        url: link.url,
        order: link.order,
        createdAt: link.createdAt,
      }));
    } catch (error) {
      console.error("Error fetching links:", error);
      return [];
    }
  },
  ["getLinksFromDB"],
  {
    revalidate: 300,
    tags: ["links"],
  },
);

export async function getLinksCount() {
  const user = await getUserFromSession();
  const userId = user?.id;
  const profileData = await getProfileData();
  const guestLinksLength = profileData?.links?.length || 0;
  return _getCachedLinksCount(userId, guestLinksLength);
}

const _getCachedLinksCount = cache(
  async (userId: string | undefined, guestLinksLength: number) => {
    if (userId) {
      const { db } = await connectToDatabase();
      const collection = db.collection<LinkDocument>("links");
      return await collection.countDocuments({ userId });
    } else {
      return guestLinksLength;
    }
  },
  ["getLinksCount"],
  {
    revalidate: 600,
    tags: ["links-count"],
  },
);
