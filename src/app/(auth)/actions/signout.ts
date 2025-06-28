"use server";

import { redirect } from "next/navigation";
import { clearSession } from "../_lib/session";

export async function signOut() {
  await clearSession();
  redirect("/signin");
}
