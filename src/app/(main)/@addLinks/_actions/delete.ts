"use server";

import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

import connectToDatabase from "@/lib/db";
import { DeleteLinkState, LinkDocument, UserDocument } from "@/lib/types";
import { getGuestSessionId, getUserFromSession } from "@/app/(auth)/_lib/session";

export async function deleteLink(prevState: DeleteLinkState, linkId: string) {
  const user = await getUserFromSession();
  const userId = user?.id;

  try {
    let success = false;

    if (userId && user.registered) {
      success = await deleteRegisteredUserLink(linkId, userId);
    } else {
      success = await deleteGuestUserLink(linkId);
    }
    if (success) {
      return { success: true, deletedId: linkId };
    } else {
      return { success: false, error: "Failed to delete link" };
    }
  } catch (error) {
    console.error("Error in deleteLink action:", error);
    return { success: false, error: "An error occurred while deleting the link" };
  }
}

async function deleteRegisteredUserLink(id: string, userId: string) {
  const { db, client } = await connectToDatabase();
  const collection = db.collection<LinkDocument>("links");
  try {
    const linkToDelete = await collection.findOne({
      _id: new ObjectId(id),
      userId,
    });

    if (!linkToDelete) {
      console.log("No link found with the given ID");
      return false;
    }

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await collection.deleteOne({ _id: linkToDelete._id }, { session });
        await collection.updateMany(
          { order: { $gt: linkToDelete.order }, userId },
          { $inc: { order: -1 } },
          { session },
        );
      });

      revalidateTag("links");
      revalidateTag("links-count");
      return true;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Error deleting registered user link:", error);
    return false;
  }
}

async function deleteGuestUserLink(id: string) {
  const guestSessionId = await getGuestSessionId();
  if (!guestSessionId) {
    console.log("No guest session found for deletion");
    return false;
  }

  const { db } = await connectToDatabase();
  const collection = db.collection<UserDocument>("users");

  try {
    const guestUser = await collection.findOne({
      guestSessionId,
      registered: false,
    });

    if (!guestUser || !guestUser.links) {
      console.log("No guest user or links found");
      return false;
    }

    // Remove the link and reorder
    const updatedLinks = guestUser.links
      .filter((link) => link._id?.toString() !== id)
      .map((link, index) => ({
        ...link,
        order: index + 1, // Reorder starting from 1
      }));

    await collection.updateOne(
      { guestSessionId, registered: false },
      { $set: { links: updatedLinks } },
    );

    console.log("🗑️ Guest user link deleted successfully");
    revalidateTag("profile");
    revalidateTag("links-count");
    return true;
  } catch (error) {
    console.error("Error deleting guest user link:", error);
    return false;
  }
}
