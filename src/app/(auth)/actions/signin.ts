"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { config } from "@/lib/config";
import connectToDatabase from "@/lib/db";
import { UserDocument } from "@/lib/types";
import { verifyPassword } from "../_lib/hasher";
import { createUserSession } from "../_lib/session";

import { SignInFormData, signInSchema } from "../schema/signIn-schema";
import { AuthFormState } from "../_components/auth-compound-form";

import { transferGuestLinksToUser, transferGuestProfileToUser } from "./transfers";

export async function loginUser(prevState: AuthFormState, formData: FormData) {
  const data: SignInFormData = {
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
  };

  const result = signInSchema.safeParse(data);
  if (result.success) {
    return await handleUserLogin(result.data);
  }
  return {
    success: false,
    errors: result.error?.errors.map((err) => ({
      field: typeof err.path[0] === "string" ? err.path[0] : "general",
      message: err.message,
    })),
  };
}

async function handleUserLogin(data: SignInFormData) {
  try {
    const { db } = await connectToDatabase();
    const user = await db
      .collection<UserDocument>("users")
      .findOne({ email: data.email, registered: true });

    if (!user) {
      return {
        success: false,
        errors: [{ field: "general", message: "Please check your email and password" }],
      };
    }

    const isPasswordValid = await verifyPassword(
      user.password ?? "",
      data.password,
      user.salt ?? "",
    );
    if (!isPasswordValid) {
      return {
        success: false,
        errors: [{ field: "general", message: "Please check your email and password" }],
      };
    }

    const userId = user._id.toString();
    await createUserSession(userId);
    await transferGuestLinksToUser(userId);
    await transferGuestProfileToUser(userId);

    const cookieStore = await cookies();
    cookieStore.delete(config.GUEST_SESSION_KEY);
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      success: false,
      errors: [{ field: "general", message: "Internal server error" }],
    };
  }

  redirect("/");
}
