"use server";

import connectToDatabase from "@/lib/db";
import { UserDocument } from "@/lib/types";
import { getGuestSessionId } from "@/app/(auth)/_lib/session";

export async function markGuestAsNotified() {
  const guestSessionId = await getGuestSessionId();
  if (!guestSessionId) return;

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<UserDocument>("users");

    await collection.updateOne(
      { guestSessionId, registered: false },
      { $set: { isNotified: true } },
    );

    console.log("Guest marked as notified");
  } catch (error) {
    console.error("Error marking guest as notified:", error);
  }
}
