"use server";

import { Collection, ObjectId } from "mongodb";
import { revalidatePath, revalidateTag } from "next/cache";

import { cache } from "@/lib/cache";
import { config } from "@/lib/config";
import connectToDatabase from "@/lib/db";
import { extractUserNameParts } from "@/lib/utils";
import { TEST_GUEST_SESSION_EXPIRE_TIME } from "@/lib/constants";
import { UserDocument, User, UserProfileDisplay, Link } from "@/lib/types";
import {
  getGuestSessionId,
  getUserFromSession,
  getOrCreateGuestSession,
} from "@/app/(auth)/_lib/session";
import {
  ProfileServerState,
  ProfileFormData,
  profileSchema,
  ProfileDataToSave,
} from "../schema/profile-schema";
import { uploadToCloudinary } from "./cloudinary";

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

export async function updateProfile(
  prevState: ProfileServerState,
  formData: FormData,
): Promise<ProfileServerState> {
  const image = formData.get("image") as File;

  const data: ProfileFormData = {
    firstName: formData.get("firstName")?.toString() ?? "",
    lastName: formData.get("lastName")?.toString() ?? "",
    displayEmail: formData.get("displayEmail")?.toString() ?? "",
    image: image?.size > 0 ? image : undefined,
  };

  const result = profileSchema.safeParse(data);

  if (result.success) {
    return await handleProfileUpdate(result.data);
  }

  return {
    success: false,
    errors: result.error.flatten().fieldErrors,
    message: "Form submission failed. Please check your input.",
  };
}

async function handleProfileUpdate(data: ProfileFormData) {
  try {
    let image: string = "";
    let imageUploaded = false;

    if (data.image) {
      try {
        console.log("Uploading image to Cloudinary...");
        image = await uploadToCloudinary(data.image);
        imageUploaded = true;
      } catch (uploadError) {
        console.log("Image upload failed:", uploadError);
        return {
          success: false,
          message: "Failed to upload image. Please try again.",
          data, // Needed for displaying error message related to image upload
        };
      }
    }
    // Check if user is authenticated
    const user = await getUserFromSession();
    const { db } = await connectToDatabase();
    const collection = db.collection<Omit<UserDocument, "email">>("users");

    const profileData: ProfileDataToSave = {
      username: data.firstName + " " + data.lastName,
      displayEmail: data.displayEmail ?? "",
      ...(image && { image }),
    };

    if (user?.id && user.registered) {
      await collection.updateOne({ _id: new ObjectId(user.id) }, { $set: profileData });
      revalidatePath("/");
    } else {
      await handleGuestProfileUpdate(profileData, collection);
    }

    return {
      success: true,
      message: "Profile updated successfully!",
      imageUploaded,
    };
  } catch {
    return {
      success: false,
      message: "Failed to update profile. Please try again.",
    };
  }
}

async function handleGuestProfileUpdate(
  data: ProfileDataToSave,
  collection: Collection<Omit<UserDocument, "email">>,
) {
  const guestSessionId = await getOrCreateGuestSession();
  const createdAt = new Date();
  const guestExpireTime =
    config.NODE_ENV === "production"
      ? parseInt(config.GUEST_SESSION_EXPIRE_TIME)
      : TEST_GUEST_SESSION_EXPIRE_TIME;
  const expiresAt = new Date(createdAt.getTime() + guestExpireTime);

  const guestUserData = {
    ...data,
    registered: false,
    guestSessionId,
    createdAt,
    expiresAt,
    isNotified: false,
  };

  const exGuestUser = await collection.findOne({
    guestSessionId,
    registered: false,
  });

  // Update existing guest user profile
  if (exGuestUser) {
    try {
      await collection.updateOne(
        { guestSessionId, registered: false },
        {
          $set: {
            displayEmail: guestUserData.displayEmail,
            username: guestUserData.username,
            ...(data.image && { image: data.image }),
          },
        },
      );
      console.log("Updated existing guest user profile");
    } catch (error) {
      console.log("Error updating guest user profile:", error);
      return {
        success: false,
        message: "Failed to update guest profile. Please try again.",
      };
    }
  } else {
    // Create new guest user profile
    try {
      await collection.insertOne(guestUserData);
      console.log("Created new guest user profile");
    } catch (error) {
      console.error("Error creating guest user profile:", error);
      return {
        success: false,
        message: "Failed to create guest profile. Please try again.",
      };
    }
  }

  revalidatePath("/");
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
