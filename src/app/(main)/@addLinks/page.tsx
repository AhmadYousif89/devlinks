import { cookies } from "next/headers";

import { cache } from "@/lib/cache";
import { config } from "@/lib/config";
import connectToDatabase from "@/lib/db";
import { Link, LinkDocument } from "@/lib/types";

import { getUserFromSession } from "@/app/(auth)/_lib/session";
import { AddLinks } from "@/app/(main)/@addLinks/_components/links";

export default async function AddLinksSlot() {
  return <AddLinks />;
}

// Extract dynamic logic into a separate function
async function getUserContext() {
  const user = await getUserFromSession();
  const userId = user?.id;

  if (userId) {
    return { userId, guestSessionId: undefined };
  }

  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get(config.GUEST_SESSION_KEY)?.value;
  return { userId: null, guestSessionId };
}

// Make cached function pure - only depends on parameters
const _getLinksFromDBCached = cache(
  async (userId: string | null, guestSessionId: string | undefined): Promise<Link[]> => {
    const { db } = await connectToDatabase();
    const collection = db.collection<LinkDocument>("links");

    // Build query based on passed parameters
    let query = {};
    if (userId) {
      query = { userId };
    } else if (guestSessionId) {
      query = { guestSessionId, userId: { $exists: false } };
    } else {
      return []; // No links for new guests
    }

    try {
      const links = await collection
        .find(query)
        .sort({ order: 1 })
        .project<Link>({
          _id: 0,
          id: { $toString: "$_id" },
          platform: 1,
          url: 1,
          order: 1,
          createdAt: 1,
        })
        .toArray();

      console.log("Links fetched from DB:", links);
      return links;
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

// Public function that extracts dynamic data and calls the cached function
export async function getLinksFromDB() {
  const { userId, guestSessionId } = await getUserContext();
  return _getLinksFromDBCached(userId, guestSessionId);
}

const _getLinksCountCached = cache(
  async (userId: string | null, guestSessionId: string | undefined) => {
    const { db } = await connectToDatabase();
    const collection = db.collection<LinkDocument>("links");

    let query = {};
    if (userId) {
      query = { userId };
    } else if (guestSessionId) {
      query = { guestSessionId, userId: { $exists: false } };
    } else {
      return 0; // No links for new guests
    }

    return await collection.countDocuments(query);
  },
  ["getLinksCount"],
  {
    revalidate: 600,
    tags: ["links-count"],
  },
);

export async function getLinksCount() {
  const { userId, guestSessionId } = await getUserContext();
  return _getLinksCountCached(userId, guestSessionId);
}
