"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { config } from "@/lib/config";
import connectToDatabase from "@/lib/db";
import { UserDocument } from "@/lib/types";
import { verifyPassword } from "../_lib/hasher";
import { createUserSession } from "../_lib/session";

import { signInSchema } from "../schema/signIn-schema";
import { AuthFormState } from "../_components/auth-compound-form";
import { transferGuestLinksToUser } from "@/app/(main)/actions/links";
import { transferGuestProfileToUser } from "@/app/(main)/actions/profile";

export async function loginUser(prevState: AuthFormState, formData: FormData) {
  const data = {
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
  };

  try {
    signInSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const result = {
        success: false,
        errors: error.errors.map((err) => ({
          field: typeof err.path[0] === "string" ? err.path[0] : "general",
          message: err.message,
        })),
      };
      return result;
    }
    return {
      success: false,
      errors: [{ field: "general", message: "Invalid form data" }],
    };
  }

  const { email, password } = data;

  try {
    const { db } = await connectToDatabase();
    const user = await db.collection<UserDocument>("users").findOne({ email });

    if (!user) {
      return {
        success: false,
        errors: [{ field: "general", message: "Please check your email and password" }],
      };
    }

    // Check password
    const isPasswordValid = await verifyPassword(user.password ?? "", password, user.salt ?? "");
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
