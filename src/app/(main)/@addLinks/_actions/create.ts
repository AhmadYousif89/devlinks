"use server";

import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

import { config } from "@/lib/config";
import connectToDatabase from "@/lib/db";
import { TEST_GUEST_SESSION_EXPIRE_TIME } from "@/lib/constants";
import { LinkDocument, PlatformNames, UserDocument } from "@/lib/types";
import {
  getGuestSessionId,
  getOrCreateGuestSession,
  getUserFromSession,
} from "@/app/(auth)/_lib/session";

export async function createNewLink() {
  const user = await getUserFromSession();
  const userId = user?.id;

  if (userId && user.registered) {
    console.log("Creating new link for registered user:", userId);
    await createRegisteredUserLink(userId);
  } else {
    console.log("Creating new link for guest user");
    await createGuestUserLink();
  }
}

async function createRegisteredUserLink(userId: string) {
  const { db } = await connectToDatabase();
  const collection = db.collection<LinkDocument>("links");
  try {
    const createdAt = new Date();
    const lastLink = await collection.findOne({ userId }, { sort: { order: -1 } });
    const nextOrder = lastLink ? lastLink.order + 1 : 1;

    const newLink: LinkDocument = {
      platform: "GitHub" as PlatformNames,
      url: "",
      order: nextOrder,
      createdAt,
      userId,
    };

    await collection.insertOne(newLink);
    console.log("New registered user link created");
    revalidateTag("links");
    revalidateTag("links-count");
  } catch (error) {
    console.error("Error creating registered user link:", error);
  }
}

async function createGuestUserLink() {
  const { db } = await connectToDatabase();
  const collection = db.collection<UserDocument>("users");
  try {
    const guestSessionId = await getOrCreateGuestSession();

    const createdAt = new Date();
    const guestExpireTime =
      config.NODE_ENV === "production"
        ? parseInt(config.GUEST_SESSION_EXPIRE_TIME)
        : TEST_GUEST_SESSION_EXPIRE_TIME;
    const expiresAt = new Date(createdAt.getTime() + guestExpireTime);

    // Find existing guest user or create new one
    const guestUser = await collection.findOne({
      guestSessionId,
      registered: false,
    });

    const newLink: LinkDocument = {
      _id: new ObjectId(),
      platform: "GitHub" as PlatformNames,
      url: "",
      order: 1, // Will update based on existing guest links
      createdAt,
    };

    if (guestUser) {
      // Update existing guest user
      const currentLinks = guestUser?.links || [];
      const nextOrder =
        currentLinks.length > 0 ? Math.max(...currentLinks.map((l) => l.order)) + 1 : 1;

      newLink.order = nextOrder;

      await collection.updateOne(
        { guestSessionId, registered: false },
        { $push: { links: newLink } },
      );
    } else {
      const newGuestUser: UserDocument = {
        registered: false,
        guestSessionId,
        email: `guest-${guestSessionId}@temp.local`,
        createdAt,
        expiresAt, // TTL index will handle expiration
        isNotified: false, // First link, so not notified yet
        links: [newLink],
      };

      await collection.insertOne(newGuestUser);
    }

    console.log("New guest user link created");
    revalidateTag("profile");
    revalidateTag("links-count");
  } catch (error) {
    console.error("Error creating guest user link:", error);
  }
}

// Function to transfer guest links to registered user
export async function transferGuestLinksToUser(userId: string) {
  const guestSessionId = await getGuestSessionId();
  if (!guestSessionId) return;

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection<UserDocument>("users");
    const linksCollection = db.collection<LinkDocument>("links");

    // Get guest user data
    const guestUser = await usersCollection.findOne({
      guestSessionId,
      registered: false,
    });

    if (!guestUser || !guestUser.links || guestUser.links.length === 0) {
      console.log("No guest links to transfer");
      return;
    }

    // Convert guest embedded links to separate documents
    const linksToInsert = guestUser.links.map((link) => ({
      platform: link.platform,
      url: link.url,
      order: link.order,
      createdAt: link.createdAt,
      userId,
    }));
    // Insert links into links collection
    await linksCollection.insertMany(linksToInsert);
    console.log(`Transferred ${linksToInsert.length} links to user ${userId}`);
    return;
  } catch (error) {
    console.error("Error transferring guest links:", error);
    return 0;
  }
}
