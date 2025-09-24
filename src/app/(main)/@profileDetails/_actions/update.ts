"use server";

import { Collection, ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

import { config } from "@/lib/config";
import connectToDatabase from "@/lib/db";
import { UserDocument } from "@/lib/types";
import { TEST_GUEST_SESSION_EXPIRE_TIME } from "@/lib/constants";
import { getUserFromSession, getOrCreateGuestSession } from "@/app/(auth)/_lib/session";
import {
  ProfileServerState,
  ProfileDataToSave,
  ProfileFormData,
  profileSchema,
} from "../../schema/profile.schema";
import { uploadToCloudinary } from "../../actions/cloudinary";

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
      ...(image && imageUploaded && { image }),
    };

    let result;
    if (user?.id && user.registered) {
      result = await updateRegisteredUser(profileData, user.id, collection);
    } else {
      result = await updateGuestUser(profileData, collection);
    }
    if (result && !result.success) {
      return result;
    }

    return {
      success: true,
      message: "Your changes have been successfully saved!",
      imageUploaded,
    };
  } catch {
    return {
      success: false,
      message: "Failed to update profile. Please try again.",
    };
  }
}

async function updateRegisteredUser(
  data: ProfileDataToSave,
  userId: string,
  collection: Collection<Omit<UserDocument, "email">>,
) {
  try {
    const currentUser = await collection.findOne({ _id: new ObjectId(userId) });
    if (!currentUser) {
      return {
        success: false,
        message: "User not found. Please try again.",
      };
    }

    const shouldUpdate = hasProfileChanges(data, currentUser, data.image !== undefined);

    if (shouldUpdate) {
      await collection.updateOne({ _id: new ObjectId(userId) }, { $set: data });
      console.log("Updated registered user profile");
      revalidatePath("/");
      return {
        success: true,
        message: "Your changes have been successfully saved!",
        imageUploaded: data.image !== undefined,
      };
    }

    return {
      success: true,
      message: "No changes detected. Profile not updated.",
      imageUploaded: data.image !== undefined,
    };
  } catch (error) {
    console.log("Error updating registered user profile:", error);
    return {
      success: false,
      message: "Failed to update profile. Please try again.",
    };
  }
}

async function updateGuestUser(
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
    // Only update fields that are provided in the data
    const shouldUpdate = hasProfileChanges(guestUserData, exGuestUser, !!data.image);

    if (!shouldUpdate) {
      return {
        success: true,
        message: "No changes detected. Profile not updated.",
        imageUploaded: !!data.image,
      };
    }

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

function hasProfileChanges(
  newData: ProfileDataToSave,
  existingData: Omit<UserDocument, "email"> | null,
  imageUploaded: boolean,
): boolean {
  return Object.keys(newData).some((key) => {
    if (key === "username") return newData.username !== existingData?.username;
    if (key === "displayEmail") return newData.displayEmail !== existingData?.displayEmail;
    if (key === "image" && imageUploaded) return newData.image !== existingData?.image;
    return false;
  });
}
