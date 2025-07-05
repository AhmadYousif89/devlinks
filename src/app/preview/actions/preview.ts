"use server";

import { LinkDocument, User } from "@/lib/types";
import { ShareLinkState } from "../share-link";
import connectToDatabase from "@/lib/db";

export async function validateUserInfo(prevState: ShareLinkState, user: User | null) {
  const missingInfo: string[] = [];
  const emptyLinkIds: string[] = [];

  if (!user) {
    return { isValid: false, missingInfo: ["No User Profile"] };
  }

  // Check for missing profile image
  if (!user.image || user.image.trim() === "") {
    missingInfo.push("Missing Profile Image");
  }

  // This case should never happen, but just in case
  if (!user.username || user.username.trim() === "") {
    missingInfo.push("Missing Name");
  }

  // This case should never happen, but just in case
  if (!user.email || user.email.trim() === "") {
    missingInfo.push("Missing Email Address");
  }

  // Check for missing or empty links
  const { db } = await connectToDatabase();
  const linksCollection = db.collection<LinkDocument>("links");
  const links = await linksCollection.find({ userId: user.id }).toArray();

  if (!links || links.length === 0) {
    missingInfo.push("Missing Shareable Links");
  } else {
    // Check for links with empty URLs
    const emptyLinks = links.filter((link) => !link.url || link.url.trim() === "");
    if (emptyLinks.length > 0) {
      emptyLinkIds.push(...emptyLinks.map((link) => link._id?.toString() || "").filter(Boolean));
      missingInfo.push(
        `Missing URL for ${emptyLinks.length} Link${emptyLinks.length > 1 ? "s" : ""}`,
      );
    }
  }

  return {
    isValid: missingInfo.length === 0,
    missingInfo,
    ...(emptyLinkIds.length > 0 ? { emptyLinkIds } : {}),
  };
}
