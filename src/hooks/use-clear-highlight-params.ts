"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

type ShouldDelete = "ALL" | "LINKS" | "PROFILE";

export const useClearHighlightParams = () => {
  const router = useRouter();

  const clearHighlightParams = useCallback(
    (shouldDelete: ShouldDelete = "ALL") => {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      let shouldUpdateUrl = false;

      if (shouldDelete === "PROFILE" && params.has("highlight")) {
        params.delete("highlight");
        shouldUpdateUrl = true;
      } else if (shouldDelete === "LINKS" && params.has("highlight-links")) {
        params.delete("highlight-links");
        shouldUpdateUrl = true;
      } else {
        if (params.has("highlight") || params.has("highlight-links")) {
          params.delete("highlight");
          params.delete("highlight-links");
          shouldUpdateUrl = true;
        }
      }

      if (shouldUpdateUrl) {
        const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
        router.replace(newUrl);
      }
    },
    [router],
  );

  return clearHighlightParams;
};
