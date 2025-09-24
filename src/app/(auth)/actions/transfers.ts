import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

import connectToDatabase from "@/lib/db";
import { getGuestSessionId } from "../_lib/session";
import { LinkDocument, UserDocument } from "@/lib/types";

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

export async function transferGuestProfileToUser(userId: string) {
  const guestSessionId = await getGuestSessionId();

  if (!guestSessionId) return; // Nothing to transfer if no guest session exists

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<UserDocument>("users");

    const guestUser = await collection.findOne({
      guestSessionId,
      registered: false,
    });

    if (guestUser) {
      const updateFields = {} as Pick<UserDocument, "username" | "image" | "displayEmail">;

      if (guestUser.username?.trim()) {
        updateFields.username = guestUser.username;
      }

      if (guestUser.image?.trim()) {
        updateFields.image = guestUser.image;
      }

      if (guestUser.displayEmail?.trim()) {
        updateFields.displayEmail = guestUser.displayEmail;
      }

      // Only update if there are fields to update
      if (Object.keys(updateFields).length > 0) {
        await collection.updateOne({ _id: new ObjectId(userId) }, { $set: updateFields });
      }
      // Delete the guest user profile after successful transfer
      await collection.deleteOne({ guestSessionId, registered: false });
      revalidateTag("profile");
      console.log(`Transferred profile data to user ${userId}`);
    }
  } catch (error) {
    console.error("Error transferring profile data:", error);
  }
}
