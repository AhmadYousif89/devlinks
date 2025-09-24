import "server-only";

import { cache } from "@/lib/cache";
import connectToDatabase from "@/lib/db";
import { extractUserNameParts } from "@/lib/utils";
import { UserDocument, User, UserProfileDisplay, Link } from "@/lib/types";
import { getGuestSessionId, getUserFromSession } from "@/app/(auth)/_lib/session";

async function getUserProfileContext() {
  const user = await getUserFromSession();
  if (user?.id && user.registered) {
    return {
      type: "registered" as const,
      userId: user.id,
      userData: user,
    };
  }

  const guestSessionId = await getGuestSessionId();
  return {
    type: "guest" as const,
    guestSessionId,
    userData: null,
  };
}

export async function getProfileData() {
  const ctx = await getUserProfileContext();

  if (ctx.type === "registered" && ctx.userId) {
    const user = await _getRegisteredProfileData(ctx.userData);
    return user;
  } else if (ctx.type === "guest" && ctx.guestSessionId) {
    const guest = await _getGuestProfileData(ctx.guestSessionId);
    return guest;
  }

  return null;
}

const _getRegisteredProfileData = cache(
  async (user: User) => {
    const [firstName, lastName] = extractUserNameParts(user.username);
    const userProfile: UserProfileDisplay = {
      firstName,
      lastName,
      displayEmail: user.displayEmail || user.email,
      image: user.image || "",
      registered: true,
    };
    return userProfile;
  },
  ["_getRegisteredProfileData"],
  {
    revalidate: 300,
    tags: ["profile"],
  },
);

const _getGuestProfileData = cache(
  async (guestSessionId: string) => {
    const { db } = await connectToDatabase();
    const collection = db.collection<Omit<UserDocument, "email">>("users");
    const guestUser = await collection.findOne({
      guestSessionId,
      registered: false,
    });

    if (!guestUser) return null;

    const [firstName, lastName] = extractUserNameParts(guestUser.username);
    const links: Link[] = (guestUser.links || []).map((link) => ({
      id: link._id?.toString() || "",
      platform: link.platform,
      url: link.url,
      order: link.order,
      createdAt: link.createdAt,
    }));

    const guest: UserProfileDisplay = {
      firstName,
      lastName,
      displayEmail: guestUser.displayEmail || "",
      image: guestUser.image || "",
      registered: false,
      links,
    };
    return guest;
  },
  ["_getGuestProfileData"],
  {
    revalidate: 300,
    tags: ["profile"],
  },
);
