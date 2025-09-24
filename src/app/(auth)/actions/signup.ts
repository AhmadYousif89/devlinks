"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { config } from "@/lib/config";
import connectToDatabase from "@/lib/db";
import { UserDocument } from "@/lib/types";
import { hashPassword, generateSalt } from "../_lib/hasher";

import { createUserSession } from "../_lib/session";
import { signUpSchema, SignUpFormData } from "../schema/signUp-schema";
import { AuthFormState } from "../_components/auth-compound-form";
import { transferGuestLinksToUser, transferGuestProfileToUser } from "./transfers";

export async function createUserAccount(prevState: AuthFormState, formData: FormData) {
  const data = {
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    confirm: formData.get("confirm")?.toString() || "",
  };

  const result = signUpSchema.safeParse(data);
  if (result.success) {
    return await handleUserCreation(result.data);
  }

  return {
    success: false,
    errors: result.error?.errors.map((err) => ({
      field: typeof err.path[0] === "string" ? err.path[0] : "general",
      message: err.message,
    })),
  };
}

async function handleUserCreation(data: SignUpFormData) {
  const { email, password } = data;
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<UserDocument>("users");

    // Check if the user already exists
    const existingUser = await collection.findOne({ email, registered: true });
    if (existingUser) {
      return {
        success: false,
        errors: [
          {
            field: "general",
            message: "User already exists with the same email",
          },
        ],
      };
    }

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const result = await collection.insertOne({
      email,
      displayEmail: email,
      password: hashedPassword,
      salt,
      createdAt: new Date(),
      registered: true, // Set registered to true for new users
    });

    if (!result.acknowledged) {
      return {
        success: false,
        errors: [
          {
            field: "general",
            message: "Failed to create user account, Please try again later",
          },
        ],
      };
    }

    const userId = result.insertedId.toString();
    await createUserSession(userId);
    await transferGuestLinksToUser(userId);
    await transferGuestProfileToUser(userId);

    // Clear the guest session cookie after successful transfer
    const cookieStore = await cookies();
    cookieStore.delete(config.GUEST_SESSION_KEY);
  } catch (error) {
    console.error("Error signing up new user:", error);
    // Check if it's a duplicate key error
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return {
        success: false,
        errors: [
          {
            field: "email",
            message: "Email already in use",
          },
        ],
      };
    }
    return {
      success: false,
      errors: [{ field: "general", message: "An error occurred while signing up" }],
    };
  }

  redirect("/");
}
