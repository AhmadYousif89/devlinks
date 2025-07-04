import crypto from "node:crypto";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";

import {
  TEST_SESSION_EXPIRE_TIME,
  TEST_EXPIRED_NOTIFICATION_TIME,
  TEST_GUEST_SESSION_EXPIRE_TIME,
} from "@/lib/constants";
import { cache } from "@/lib/cache";
import { config } from "@/lib/config";
import connectToDatabase from "@/lib/db";
import { SessionExpirationDocument, User, UserDocument, UserSessionDocument } from "@/lib/types";

// Generate temporary session ID for guest users
export async function getOrCreateGuestSession() {
  const cookieStore = await cookies();
  const exGuestSessionId = cookieStore.get(config.GUEST_SESSION_KEY)?.value;

  const maxAge =
    config.NODE_ENV === "production"
      ? parseInt(config.GUEST_SESSION_EXPIRE_TIME)
      : TEST_GUEST_SESSION_EXPIRE_TIME;

  if (!exGuestSessionId) {
    const guestSessionId = crypto.randomUUID();
    cookieStore.set(config.GUEST_SESSION_KEY, guestSessionId, {
      httpOnly: true,
      maxAge: maxAge / 1000,
      secure: config.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    return guestSessionId;
  }

  return exGuestSessionId;
}

export async function createUserSession(userId: string) {
  if (!userId) {
    throw new Error("User ID is required to create a session");
  }

  const sessionId = crypto.randomBytes(256).toString("hex").normalize();
  const createdAt = new Date();
  const timeToExpireSession =
    config.NODE_ENV === "production"
      ? parseInt(config.SESSION_EXPIRE_TIME)
      : TEST_SESSION_EXPIRE_TIME;
  const expiresAt = new Date(createdAt.getTime() + timeToExpireSession);

  try {
    const { db } = await connectToDatabase();
    const sessionsCollection = db.collection<UserSessionDocument>("sessions");
    const expirationsCollection = db.collection<SessionExpirationDocument>("session_expirations");

    // Clean up old expiration notifications for this user
    await expirationsCollection.deleteMany({ userId });

    const session: UserSessionDocument = {
      sessionId,
      userId,
      createdAt,
      expiresAt,
    };

    const result = await sessionsCollection.insertOne(session);
    if (!result.acknowledged) {
      throw new Error("Failed to create session");
    }

    const timeToExpireNotification =
      config.NODE_ENV === "production"
        ? parseInt(config.EXPIRED_NOTIFICATION_TIME)
        : TEST_EXPIRED_NOTIFICATION_TIME;

    const expirationRecord: SessionExpirationDocument = {
      userId,
      sessionId,
      sessionExpiredAt: expiresAt,
      expiresAt: new Date(expiresAt.getTime() + timeToExpireNotification),
    };

    await expirationsCollection.insertOne(expirationRecord);

    const sessionMaxAge =
      config.NODE_ENV === "production"
        ? parseInt(config.SESSION_EXPIRE_TIME)
        : TEST_SESSION_EXPIRE_TIME;

    const cookieStore = await cookies();
    cookieStore.set(config.USER_SESSION_KEY, sessionId, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionMaxAge / 1000, // Convert to seconds
      path: "/",
    });

    const currentUserMaxAge =
      config.NODE_ENV === "production"
        ? parseInt(config.SESSION_EXPIRE_TIME + config.EXPIRED_NOTIFICATION_TIME)
        : TEST_SESSION_EXPIRE_TIME + TEST_EXPIRED_NOTIFICATION_TIME;

    cookieStore.set(config.CURRENT_USER_KEY, userId, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: currentUserMaxAge / 1000,
      path: "/",
    });
  } catch (error) {
    console.error("Error creating user session:", error);
    throw new Error("Session creation failed");
  }
}

export async function getAuthData() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(config.USER_SESSION_KEY)?.value;
    const currentUserId = cookieStore.get(config.CURRENT_USER_KEY)?.value;

    // Check for expired sessions for the last known user
    if (!sessionId && currentUserId) {
      const expiredSession = await _getCachedExpiredSession(currentUserId);
      if (expiredSession) {
        return { expired: true, userId: currentUserId };
      }
    }

    if (!sessionId) return null;

    // Get session and user data from cache
    const result = await _getCachedSessionAndUser(sessionId);
    // If session is expired or deleted on the DB return expired status
    if (result.expired) return { expired: true };

    return result;
  } catch (error) {
    console.log("Error getting current session:", error);
    return null;
  }
}

export async function getUserFromSession() {
  const auth = await getAuthData();

  if (!auth || "expired" in auth) return null;

  return auth.user;
}

export async function getUserSession() {
  const auth = await getAuthData();

  if (!auth) return null;

  if ("expired" in auth) {
    return { expired: true };
  }

  const session = auth.session;
  if (!session) return null;

  return {
    sessionId: session.sessionId,
    userId: session.userId,
  };
}

export async function getGuestSessionId() {
  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get(config.GUEST_SESSION_KEY)?.value;

  if (!guestSessionId) return;

  return guestSessionId;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(config.USER_SESSION_KEY)?.value;
  const guestSessionId = cookieStore.get(config.GUEST_SESSION_KEY)?.value;

  if (sessionId) {
    // Clear the cookie first to log user out even if DB operation fails
    cookieStore.delete(config.USER_SESSION_KEY);
    cookieStore.delete(config.CURRENT_USER_KEY);
    try {
      const { db } = await connectToDatabase();
      const sessionsCollection = db.collection<UserSessionDocument>("sessions");
      const session = await sessionsCollection.findOne({ sessionId });

      if (session) {
        const expirationsCollection =
          db.collection<SessionExpirationDocument>("session_expirations");
        await expirationsCollection.deleteMany({ userId: session.userId });
      }
      await sessionsCollection.deleteOne({ sessionId });
    } catch (error) {
      console.error("Error deleting session from DB:", error);
    }
  } else if (guestSessionId) {
    const { db } = await connectToDatabase();
    const collection = db.collection<UserDocument>("users");
    await collection.deleteOne({ guestSessionId, registered: false });
    cookieStore.delete(config.GUEST_SESSION_KEY);
  }
}

const _getCachedSessionAndUser = cache(
  async (sessionId: string) => {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection<UserDocument>("users");
    const sessionsCollection = db.collection<UserSessionDocument>("sessions");
    const session = await sessionsCollection.findOne<UserSessionDocument>({
      sessionId,
    });

    if (!session) return { expired: true };

    const user = await usersCollection.findOne({
      _id: new ObjectId(session.userId),
    });

    if (!user) return { expired: true };

    const transformedUser: User = {
      id: user._id.toString(),
      email: user.email,
      displayEmail: user.displayEmail || user.email,
      image: user.image ?? "",
      username: user.username ?? "",
      registered: user.registered,
    };

    return { session, user: transformedUser };
  },
  ["getSessionAndUser"],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ["auth", "session"],
  },
);

const _getCachedExpiredSession = cache(
  async (userId: string) => {
    const { db } = await connectToDatabase();
    const expirationsCollection = db.collection<SessionExpirationDocument>("session_expirations");

    const now = new Date();
    const expiredSession = await expirationsCollection.findOne({
      userId,
      sessionExpiredAt: { $lte: now }, // Session expiry time has passed
      expiresAt: { $gt: now }, // But notification period hasn't ended
    });

    return expiredSession;
  },
  ["getExpiredSession"],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: ["expired-sessions"],
  },
);
