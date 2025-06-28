import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeURL(url: string) {
  if (!url.trim()) return url;

  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }

  return url;
}

export function extractUserNameParts(username: string | undefined) {
  const nameParts = username?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return [firstName, lastName];
}
