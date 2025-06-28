import { z } from "zod";
import { LINKS_DATA } from "@/lib/data";
import { PlatformKey } from "@/lib/types";
import { normalizeURL } from "@/lib/utils";

const createUrlValidator = (platformKey: PlatformKey) => {
  const domains = LINKS_DATA[platformKey].domain;
  const platformName = LINKS_DATA[platformKey].name;

  return z
    .string()
    .trim()
    .min(1, "Can't be empty")
    .refine((url) => {
      try {
        const normalizedUrl = normalizeURL(url);
        const urlObj = new URL(normalizedUrl);
        // Check if hostname matches the platform domains
        const hostname = urlObj.hostname.toLowerCase();
        return domains.some(
          (domain) =>
            hostname === domain || hostname === domain.replace("www.", ""),
        );
      } catch {
        return false;
      }
    }, `Please enter a valid ${platformName} URL`);
};

// Create a dynamic schema based on the platform
export const createLinkSchema = (platformKey: PlatformKey) => {
  return z.object({
    url: createUrlValidator(platformKey),
    platform: z.enum(
      Object.keys(LINKS_DATA) as [PlatformKey, ...PlatformKey[]],
    ),
  });
};

export type LinkSchema = z.infer<ReturnType<typeof createLinkSchema>>;
