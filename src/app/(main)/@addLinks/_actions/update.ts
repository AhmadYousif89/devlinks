"use server";

import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

import connectToDatabase from "@/lib/db";
import { normalizeURL } from "@/lib/utils";
import { Link, LinkDocument, PlatformKey, PlatformNames, UserDocument } from "@/lib/types";
import { getGuestSessionId, getUserFromSession } from "@/app/(auth)/_lib/session";

export async function updateLinkForm(formData: FormData) {
  const entries = Object.fromEntries(formData.entries());
  const linkUpdates: Record<string, Partial<Link>> = {};

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
    console.log("No form data to update, skipping");
    return;
  }

  const user = await getUserFromSession();
  const userId = user?.id;
  if (userId && user.registered) {
    await updateRegisteredUserLinks(linkUpdates, userId);
  } else {
    await updateGuestUserLinks(linkUpdates);
  }
  return { success: true };
}

async function updateRegisteredUserLinks(
  linkUpdates: Record<string, Partial<Link>>,
  userId: string,
) {
  const { db } = await connectToDatabase();
  const collection = db.collection<LinkDocument>("links");

  const linkIds = Object.keys(linkUpdates).map((id) => new ObjectId(id));
  let hasActualChanges = false;
  try {
    const currentLinks = await collection.find({ _id: { $in: linkIds }, userId }).toArray();

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
      if (order !== undefined && order !== currentLink.order) {
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
      return collection.updateOne({ _id: new ObjectId(id), userId }, { $set: updatedFields });
    });

    const results = await Promise.all(updatePromises);
    const modifiedCount = results.reduce((sum, result) => sum + result.modifiedCount, 0);

    console.log(`📝 Updated ${modifiedCount} links with actual changes`);

    if (modifiedCount > 0) {
      revalidateTag("links");
      revalidateTag("links-count");
      console.log("🔄 Links cache invalidated after actual form update");
    } else {
      console.log("⏭️ No database changes made, skipping cache invalidation");
    }
  } catch (error) {
    console.error("Error updating links:", error);
    return;
  }
}

async function updateGuestUserLinks(linkUpdates: Record<string, Partial<Link>>) {
  const guestSessionId = await getGuestSessionId();
  if (!guestSessionId) {
    console.log("No guest session found for update");
    return;
  }

  let hasActualChanges = false;
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<UserDocument>("users");
    const guestUser = await collection.findOne({
      guestSessionId,
      registered: false,
    });

    if (!guestUser || !guestUser.links) {
      console.log("No guest user or links found for update");
      return;
    }

    const updatedLinks = guestUser.links.map((link) => {
      const updates = linkUpdates[link._id?.toString() || ""];
      if (!updates) return link; // No updates for this link - return the original link

      const { platform, url, order } = updates;
      console.log("Order to update:", order, "Current link order:", link.order);
      const updatedLink = { ...link };
      let hasChanges = false;

      if (!!platform && platform !== link.platform) {
        updatedLink.platform = platform;
        hasChanges = true;
      }
      if (!!url && url !== link.url) {
        updatedLink.url = url;
        hasChanges = true;
      }

      if (order !== undefined && order !== link.order) {
        updatedLink.order = order;
        hasChanges = true;
      }

      if (hasChanges) hasActualChanges = true;

      return updatedLink;
    });

    if (!hasActualChanges) {
      console.log("No actual changes detected, skipping database update");
      return;
    }

    const sortedLinks = updatedLinks.sort((a, b) => a.order - b.order);
    const result = await collection.updateOne(
      { guestSessionId, registered: false },
      { $set: { links: sortedLinks } },
    );

    console.log(`Updated ${result.modifiedCount} guest user links`);
    revalidateTag("profile");
    revalidateTag("links-count");
  } catch (error) {
    console.error("Error updating guest user links:", error);
  }
}

function isValidPlatform(value: string): value is PlatformNames | PlatformKey {
  return typeof value === "string" && value.length > 0;
}
