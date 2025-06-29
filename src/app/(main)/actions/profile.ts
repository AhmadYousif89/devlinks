"use server";

import { revalidateTag } from "next/cache";
import { Collection, ObjectId } from "mongodb";

import { cache } from "@/lib/cache";
import connectToDatabase from "@/lib/db";
import { extractUserNameParts } from "@/lib/utils";
import { TEST_GUEST_SESSION_EXPIRE_TIME } from "@/lib/constants";
import { UserDocument, User, UserProfileDisplay } from "@/lib/types";
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

const _getCachedProfileData = cache(
  async (
    type: "registered" | "guest",
    userId: string | undefined,
    userData: User | null,
    guestSessionId: string | undefined,
  ) => {
    // Return registered user data
    if (type === "registered" && userData && userId) {
      const [firstName, lastName] = extractUserNameParts(userData.username);
      const user: UserProfileDisplay = {
        firstName,
        lastName,
        displayEmail: userData.displayEmail || userData.email,
        image: userData.image || "",
        registered: true,
      };
      return user;
    }

    // Check for guest user data
    if (type === "guest" && guestSessionId) {
      const { db } = await connectToDatabase();
      const collection = db.collection<Omit<UserDocument, "email">>("users");
      const guestUser = await collection.findOne({
        guestSessionId,
        registered: false,
      });

      if (guestUser) {
        const [firstName, lastName] = extractUserNameParts(guestUser.username);
        const guest: UserProfileDisplay = {
          firstName,
          lastName,
          displayEmail: guestUser.displayEmail || "",
          image: guestUser.image || "",
          registered: false,
        };
        return guest;
      }
    }

    return null;
  },
  ["getProfileData"],
  {
    revalidate: 300, // 5 minutes
    tags: ["profile"],
  },
);

export async function getProfileData() {
  const userProfileCtx = await getUserProfileContext();

  const profileData = await _getCachedProfileData(
    userProfileCtx.type,
    userProfileCtx.userId,
    userProfileCtx.userData,
    userProfileCtx.guestSessionId,
  );

  return profileData;
}

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

    if (data.image) {
      try {
        console.log("Uploading image to Cloudinary...");
        image = await uploadToCloudinary(data.image);
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
    } else {
      await handleGuestProfileUpdate(profileData, collection);
    }

    revalidateTag("profile");

    return {
      success: true,
      message: "Profile updated successfully!",
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
  const expiresAt = new Date(createdAt.getTime() + TEST_GUEST_SESSION_EXPIRE_TIME);

  const guestUserData = {
    ...data,
    registered: false,
    guestSessionId,
    createdAt,
    expiresAt,
  };
  // Check if a guest profile already exists with the same guestSessionId
  const exGuestUser = await collection.findOne({
    guestSessionId,
    registered: false,
  });

  if (exGuestUser) {
    // Update existing guest user profile
    try {
      await collection.updateOne(
        { guestSessionId, registered: false },
        {
          $set: {
            email: guestUserData.displayEmail,
            username: guestUserData.username,
            ...(data.image && { image: data.image }),
          },
        },
      );
      console.log("✅ Updated guest user profile");
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
      console.log("✅ Created new guest user profile");
    } catch (error) {
      console.error("Error creating guest user profile:", error);
      return {
        success: false,
        message: "Failed to create guest profile. Please try again.",
      };
    }
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
      console.log(`✅ Transferred profile data to user ${userId}`);
    }
  } catch (error) {
    console.error("Error transferring profile data:", error);
  }
}
