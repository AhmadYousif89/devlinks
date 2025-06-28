import { unstable_cache as nextCache } from "next/cache";
import { cache as reactCache } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => Promise<unknown>;
export function cache<T extends Callback>(
  cb: T,
  keyParts?: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  },
): T {
  return nextCache(reactCache(cb), keyParts, options);
}
