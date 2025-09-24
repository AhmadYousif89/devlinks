"use server";
import "server-only";

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
import {
  User,
  UserSession,
  UserDocument,
  UserSessionDocument,
  SessionExpirationDocument,
} from "@/lib/types";

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

  try {
    const { db } = await connectToDatabase();
    const sessionsCollection = db.collection<UserSessionDocument>("sessions");
    const expirationsCollection = db.collection<SessionExpirationDocument>("session_expirations");

    // Clean up old expiration notifications for this user
    await expirationsCollection.deleteMany({ userId });

    const createdAt = new Date();
    const sessionExpireTime =
      config.NODE_ENV === "production"
        ? parseInt(config.SESSION_EXPIRE_TIME)
        : TEST_SESSION_EXPIRE_TIME;
    const expiresAt = new Date(createdAt.getTime() + sessionExpireTime);

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

    const notificationExpireTime =
      config.NODE_ENV === "production"
        ? parseInt(config.EXPIRED_NOTIFICATION_TIME)
        : TEST_EXPIRED_NOTIFICATION_TIME;

    const expirationRecord: SessionExpirationDocument = {
      userId,
      sessionId,
      sessionExpiredAt: expiresAt,
      expiresAt: new Date(expiresAt.getTime() + notificationExpireTime),
    };

    await expirationsCollection.insertOne(expirationRecord);

    const cookieStore = await cookies();
    cookieStore.set(config.USER_SESSION_KEY, sessionId, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionExpireTime / 1000, // Convert to seconds
      path: "/",
    });

    const currentUserMaxAge = (sessionExpireTime + notificationExpireTime) / 1000;

    cookieStore.set(config.CURRENT_USER_KEY, userId, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: currentUserMaxAge,
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

    // Get session and user data from cache
    const result = await _getCachedSessionAndUser(sessionId, currentUserId);
    // If session is expired or deleted on the DB return expired status
    if (result && result.expired) return { expired: true };

    return result;
  } catch (error) {
    if (config.NODE_ENV === "development" || process.env.VERCEL) {
      console.log("Error getting current session:", error);
    }
    return null;
  }
}

export async function getUserFromSession() {
  const auth = await getAuthData();

  if (!auth || "expired" in auth) return null;

  return auth.user;
}

export async function getUserSession(): Promise<UserSession | null> {
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
  return cookieStore.get(config.GUEST_SESSION_KEY)?.value;
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
  async (sessionId: string | undefined, currentUserId: string | undefined) => {
    const { db } = await connectToDatabase();

    try {
      const expirationsCollection = db.collection("session_expirations");
      const now = new Date();
      const expiredSession = await expirationsCollection.findOne({
        userId: currentUserId,
        sessionExpiredAt: { $lte: now },
        expiresAt: { $gt: now },
      });

      if (expiredSession) {
        return { expired: true, userId: currentUserId };
      }
    } catch (error) {
      console.error("Error checking expired session in middleware:", error);
    }

    if (!sessionId) return null;

    try {
      const sessionsCollection = db.collection<UserSessionDocument>("sessions");
      const session = await sessionsCollection.findOne<UserSessionDocument>({
        sessionId,
      });

      if (!session) return { expired: true };

      const usersCollection = db.collection<UserDocument>("users");
      const user = await usersCollection.findOne({
        _id: new ObjectId(session.userId),
      });

      if (!user) return { expired: true };

      const transformedUser: User = {
        id: user._id.toString(),
        email: user.email || "",
        displayEmail: user.displayEmail || user.email || "",
        image: user.image || "",
        username: user.username || "",
        registered: user.registered,
      };

      return { session, user: transformedUser };
    } catch (e) {
      console.log("Error fetching session and user:", e);
      return { expired: true };
    }
  },
  ["getSessionAndUser"],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ["auth", "session"],
  },
);
