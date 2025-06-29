"use server";

import { ObjectId } from "mongodb";

import connectToDatabase from "@/lib/db";
import { Link, LinkDocument, UserDocument, PublicUserProfile } from "@/lib/types";

export async function getUserById(id: string) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<UserDocument>("users");

    // Validate the ID format
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await collection.findOne({ _id: new ObjectId(id) });

    if (!user) return null;

    const transformedUser: PublicUserProfile = {
      displayEmail: user.displayEmail,
      username: user.username || "",
      image: user.image || "",
    };

    return transformedUser;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getUserLinks(id: string) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<LinkDocument>("links");
    const links = await collection
      .find({ userId: id })
      .sort({ order: 1 })
      .project<Link>({
        _id: 0,
        id: { $toString: "$_id" },
        platform: 1,
        url: 1,
        order: 1,
        createdAt: 1,
      })
      .toArray();
    return links;
  } catch (error) {
    console.error("Error fetching user links:", error);
    return [];
  }
}
