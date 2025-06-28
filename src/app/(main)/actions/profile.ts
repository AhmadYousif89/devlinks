"use server";

import { Collection, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

import { cache } from "@/lib/cache";
import { config } from "@/lib/config";
import connectToDatabase from "@/lib/db";
import { extractUserNameParts } from "@/lib/utils";
import { ProfileServerState, UserDocument, User, UserProfileDisplay } from "@/lib/types";
import { TEST_GUEST_SESSION_EXPIRE_TIME } from "@/lib/constants";
import {
  getGuestSessionId,
  getUserFromSession,
  getOrCreateTempSession,
} from "@/app/(auth)/_lib/session";
import { uploadToCloudinary } from "./cloudinary";
import { ProfileFormData, profileSchema } from "../schema/profile-schema";

type profileDataToSave = {
  username: string;
  displayEmail: string;
  email: string;
  image?: string;
};

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

const _getProfileDataCached = cache(
  async (
    type: "registered" | "guest",
    userId: string | undefined,
    userData: User | null,
    guestSessionId: string | undefined,
  ) => {
    const { db } = await connectToDatabase();
    const collection = db.collection<UserDocument>("users");

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
      const guestUser = await collection.findOne({
        guestSessionId,
        registered: false,
      });

      if (guestUser) {
        const [firstName, lastName] = extractUserNameParts(guestUser.username);
        const guest: UserProfileDisplay = {
          firstName,
          lastName,
          displayEmail: guestUser.displayEmail || guestUser.email,
          image: guestUser.image || "",
          registered: false,
        };
        return guest;
      }
    }

    // Return empty data for new guests
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

  const profileData = await _getProfileDataCached(
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
  const profileImage = formData.get("profileImage") as File;

  const data: ProfileFormData = {
    firstName: formData.get("firstName")?.toString() ?? "",
    lastName: formData.get("lastName")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    profileImage: profileImage?.size > 0 ? profileImage : undefined,
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

    if (data.profileImage) {
      try {
        console.log("Uploading image to Cloudinary...");
        image = await uploadToCloudinary(data.profileImage);
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
    const collection = db.collection<UserDocument>("users");

    if (user?.id && user.registered) {
      const profileData: Omit<profileDataToSave, "email"> = {
        username: data.firstName + " " + data.lastName,
        displayEmail: data.email ?? "",
        ...(image && { image }),
      };
      await collection.updateOne({ _id: new ObjectId(user.id) }, { $set: profileData });
    } else {
      const profileData: profileDataToSave = {
        username: data.firstName + " " + data.lastName,
        email: data.email ?? "",
        displayEmail: data.email ?? "",
        ...(image && { image }),
      };
      console.log("Handling guest profile update...");
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
  data: profileDataToSave,
  collection: Collection<UserDocument>,
) {
  const guestSessionId = await getOrCreateTempSession();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + TEST_GUEST_SESSION_EXPIRE_TIME);

  const guestUserData: UserDocument = {
    ...data,
    registered: false,
    guestSessionId,
    createdAt,
    expiresAt,
  };
  console.log("Guest user data:", guestUserData);
  // Check if a guest profile already exists with the same guestSessionId in the database
  const exGuestUser = await collection.findOne({
    guestSessionId,
    registered: false,
  });

  if (exGuestUser) {
    // Update existing guest user profile
    try {
      console.log("Updating existing guest user profile...");
      await collection.updateOne(
        { guestSessionId, registered: false },
        {
          $set: {
            email: guestUserData.email,
            username: guestUserData.username,
            ...(data.image && { image: data.image }),
          },
        },
      );
      console.log("✅ Updated guest user profile");
    } catch (error) {
      console.error("Error updating guest user profile:", error);
      return {
        success: false,
        message: "Failed to update guest profile. Please try again.",
      };
    }
  } else {
    try {
      // Create new guest user profile
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
  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get(config.GUEST_SESSION_KEY)?.value;

  if (!guestSessionId) return; // Nothing to transfer if no guest session exists

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<UserDocument>("users");

    const guestUser = await collection.findOne({
      guestSessionId,
      registered: false,
    });

    if (guestUser) {
      const updateFields: Partial<UserDocument> = {};

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
        console.log(`✅ Transferred profile data to user ${userId}:`, updateFields);
      }
      // Delete the guest user profile after successful transfer
      await collection.deleteOne({ guestSessionId, registered: false });
      // Revalidate the profile tag to refresh cached data
      revalidateTag("profile");
      console.log(`✅ Transferred profile data to user ${userId}`);
    }
  } catch (error) {
    console.error("Error transferring profile data:", error);
  }
}
