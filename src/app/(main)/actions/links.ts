"use server";

import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

import { config } from "@/lib/config";
import connectToDatabase from "@/lib/db";
import { normalizeURL } from "@/lib/utils";
import { Link, LinkDocument, PlatformKey, PlatformNames } from "@/lib/types";
import { getOrCreateTempSession, getUserFromSession } from "@/app/(auth)/_lib/session";
import { TEST_GUEST_LINK_EXPIRE_TIME } from "@/lib/constants";

export async function createNewLink() {
  const { db } = await connectToDatabase();
  const collection = db.collection<LinkDocument>("links");

  // Check if user is logged in
  const user = await getUserFromSession();
  const userId = user?.id;
  const guestSessionId = userId ? undefined : await getOrCreateTempSession();

  try {
    const query = userId ? { userId } : { guestSessionId, userId: { $exists: false } };

    const createdAt = new Date();
    // Set expiresAt for temp links only, default to 7 days if no userId
    const expiresAt = !userId
      ? new Date(createdAt.getTime() + TEST_GUEST_LINK_EXPIRE_TIME)
      : undefined;
    const lastLink = await collection.findOne(query, { sort: { order: -1 } });
    const nextOrder = lastLink ? lastLink.order + 1 : 1;
    const newLink: LinkDocument = {
      platform: "GitHub" as PlatformNames,
      url: "",
      order: nextOrder,
      createdAt,
      ...(userId ? { userId } : { guestSessionId, expiresAt }),
    };

    await collection.insertOne(newLink);
    console.log("✨ New link created, invalidating cache...");
  } catch (error) {
    console.error("Error creating new link:", error);
  }

  console.log("🗑️ Invalidating cache tags: links, links-count");
  revalidateTag("links");
  revalidateTag("links-count");
  console.log("🔄 Cache invalidated and path revalidated");
}

export async function deleteLink(id: string) {
  const { db, client } = await connectToDatabase();
  const collection = db.collection<LinkDocument>("links");

  const user = await getUserFromSession();
  const userId = user?.id;

  let query = {};
  if (userId) {
    query = { userId };
  } else {
    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get(config.GUEST_SESSION_KEY)?.value;
    if (guestSessionId) {
      query = { guestSessionId, userId: { $exists: false } };
    } else {
      console.log("No valid session found for deletion");
      return false;
    }
  }

  try {
    const linkToDelete = await collection.findOne({
      _id: new ObjectId(id),
      ...query,
    });

    if (!linkToDelete) {
      console.log("No link found with the given ID");
      return false;
    }

    // should handle race conditions by using atomic operations
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await collection.deleteOne({ _id: linkToDelete._id }, { session });
        await collection.updateMany(
          { order: { $gt: linkToDelete.order }, ...query },
          { $inc: { order: -1 } },
          { session },
        );
      });

      console.log("🗑️ Link deleted successfully, invalidating cache...");
      revalidateTag("links");
      revalidateTag("links-count");
      return true;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Error deleting link:", error);
    return false;
  }
}

export async function updateLinkForm(formData: FormData) {
  const entries = Object.fromEntries(formData.entries());
  const linkUpdates: Record<string, Partial<Link>> = {};
  let hasActualChanges = false;

  // Extract input data from each link
  Object.entries(entries).forEach(([key, value]) => {
    if (key.startsWith("platform-")) {
      const id = key.split("-")[1];
      if (!linkUpdates[id]) linkUpdates[id] = { id };

      const platformValue = value as string;
      if (isValidPlatform(platformValue)) {
        linkUpdates[id].platform = platformValue as PlatformNames | PlatformKey;
      }
    }

    if (key.startsWith("url-")) {
      const id = key.split("-")[1];
      if (!linkUpdates[id]) linkUpdates[id] = { id };
      linkUpdates[id].url = normalizeURL(value as string);
    }

    if (key.startsWith("order-")) {
      const id = key.split("-")[1];
      if (!linkUpdates[id]) linkUpdates[id] = { id };
      linkUpdates[id].order = parseInt(value as string, 10);
    }
  });
  // Early return if no updates
  if (Object.keys(linkUpdates).length === 0) {
    console.log("⏭️ No form data to update, skipping");
    return;
  }

  const linkIds = Object.keys(linkUpdates).map((id) => new ObjectId(id));

  const { db } = await connectToDatabase();
  const collection = db.collection<LinkDocument>("links");

  const user = await getUserFromSession();
  const userId = user?.id;

  console.log("user session Id:", userId);
  let query = {};
  if (userId) {
    query = { userId };
  } else {
    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get(config.GUEST_SESSION_KEY)?.value;
    console.log("Guest session Id:", guestSessionId);
    if (guestSessionId) {
      query = { guestSessionId, userId: { $exists: false } };
    } else {
      console.log("No guest session Id was found");
      return;
    }
  }

  try {
    const currentLinks = await collection.find({ _id: { $in: linkIds }, ...query }).toArray();

    const currentLinksMap = new Map(
      currentLinks.map((link) => [
        link._id.toString(),
        {
          id: link._id.toString(),
          platform: link.platform,
          url: link.url,
          order: link.order,
        },
      ]),
    );

    const actualUpdates: Record<string, Partial<Link>> = {};

    Object.values(linkUpdates).forEach((linkData) => {
      const { id, platform, url, order } = linkData;
      if (!id) return;

      const currentLink = currentLinksMap.get(id);
      if (!currentLink) return;

      const changedFields: Partial<Link> = {};
      // Check for changes in the fields
      if (!!platform && platform !== currentLink.platform) {
        changedFields.platform = platform;
        hasActualChanges = true;
      }
      // Check for changes in url - handle empty string as a valid change
      if (!!url && url !== currentLink.url) {
        changedFields.url = url;
        hasActualChanges = true;
      }
      if (!!order && order !== currentLink.order) {
        changedFields.order = order;
        hasActualChanges = true;
      }

      // Only add the changed fields
      if (Object.keys(changedFields).length > 0) {
        actualUpdates[id] = { id, ...changedFields };
      }
    });

    if (!hasActualChanges) {
      console.log("⏭️ No actual changes detected, skipping database update");
      return;
    }

    // Only update links that actually changed
    const updatePromises = Object.values(actualUpdates).map(async (linkData) => {
      const { id, ...updatedFields } = linkData;
      return collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: updatedFields });
    });

    const results = await Promise.all(updatePromises);
    const modifiedCount = results.reduce((sum, result) => sum + result.modifiedCount, 0);

    console.log(`📝 Updated ${modifiedCount} links with actual changes`);

    if (modifiedCount > 0) {
      revalidateTag("links");
      console.log("🔄 Links cache invalidated after actual form update");
    } else {
      console.log("⏭️ No database changes made, skipping cache invalidation");
    }
  } catch (error) {
    console.error("Error updating links:", error);
    return;
  }
}

// Function to transfer temporary links to a registered user account
// This function should be called after user registration or login
export async function transferGuestLinksToUser(userId: string) {
  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get(config.GUEST_SESSION_KEY)?.value;

  if (!guestSessionId) return;

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<LinkDocument>("links");

    // Transfer anonymous links to user account
    const result = await collection.updateMany(
      {
        guestSessionId,
        userId: { $exists: false },
      },
      {
        // Remove guest session fields and set userId
        $set: { userId },
        $unset: { guestSessionId: "", expiresAt: "" },
      },
    );

    console.log(`✅ Transferred ${result.modifiedCount} links to user ${userId}`);

    return result.modifiedCount;
  } catch (error) {
    console.error("Error transferring links:", error);
    return 0;
  }
}

function isValidPlatform(value: string): value is PlatformNames | PlatformKey {
  return typeof value === "string" && value.length > 0;
}
