"use client";

import React, {
  createContext,
  useContext,
  useOptimistic,
  useState,
  useEffect,
  useCallback,
  useRef,
  startTransition,
} from "react";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Link } from "@/lib/types";
import { deleteLink } from "../@addLinks/_actions/delete";

type OptimisticAction = {
  type: "DELETE" | "ADD";
  id: string;
  linkData?: Link;
};

type LinksContextType = {
  links: Link[];
  optimisticLinks: Link[];
  deleteLink: (id: string) => Promise<void>;
  setActualLinks: (links: Link[] | ((prev: Link[]) => Link[])) => void;
};

const LinksContext = createContext<LinksContextType | null>(null);

export function LinksProvider({
  children,
  initialLinks,
}: {
  children: React.ReactNode;
  initialLinks: Link[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [links, setLinks] = useState(initialLinks);
  const pendingDeletesRef = useRef<Set<string>>(new Set());
  const deletedLinksRef = useRef<Map<string, Link>>(new Map());

  const [optimisticLinks, setOptimisticLinks] = useOptimistic(
    links,
    (currentLinks: Link[], action: OptimisticAction) => {
      if (action.type === "DELETE") {
        return currentLinks.filter((link) => link.id !== action.id);
      } else if (action.type === "ADD") {
        const linkToAdd = action.linkData || deletedLinksRef.current.get(action.id);
        if (linkToAdd) {
          const newLinks = [...currentLinks, linkToAdd];
          return newLinks.sort((a, b) => a.order - b.order);
        }
      }
      return currentLinks;
    },
  );

  const setActualLinks = useCallback((newLinks: Link[] | ((links: Link[]) => Link[])) => {
    setLinks(newLinks);
  }, []);

  useEffect(() => {
    setActualLinks(initialLinks);
  }, [initialLinks, setActualLinks]);

  // Function to immediately update URL params when a link is deleted
  // This function checks if the "highlight-links" param exists and updates it accordingly
  const updateUrlParams = useCallback(
    (deletedId: string) => {
      const hasHighlightLinkIds = searchParams.has("highlight-links");
      if (!hasHighlightLinkIds) return { updated: false, previousUrl: null };

      const currentHighlightedLinks = searchParams.get("highlight-links")?.split(",") || [];
      const previousUrl = `${pathname}?${searchParams.toString()}`;
      if (currentHighlightedLinks.includes(deletedId)) {
        const remainingHighlightedLinks = currentHighlightedLinks.filter((id) => id !== deletedId);
        const params = new URLSearchParams(searchParams.toString());
        if (remainingHighlightedLinks.length === 0) {
          params.delete("highlight-links");
        } else {
          params.set("highlight-links", remainingHighlightedLinks.join(","));
        }

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl);
        return { updated: true, previousUrl };
      }
      return { updated: false, previousUrl: null };
    },
    [pathname, router, searchParams],
  );

  const rollbackUrlParams = useCallback(
    (prevUrl: string | null) => {
      if (prevUrl) router.replace(prevUrl);
    },
    [router],
  );

  const handleDeleteLink = useCallback(
    async (id: string) => {
      // Don't allow multiple deletes of the same link
      if (pendingDeletesRef.current.has(id)) return;

      const linkToDelete = links.find((link) => link.id === id);
      if (!linkToDelete) {
        toast.error("Link not found");
        return;
      }
      // Store the link for potential revert
      deletedLinksRef.current.set(id, linkToDelete);
      // Add to pending deletes
      pendingDeletesRef.current.add(id);
      // Optimistically remove the link
      startTransition(() => {
        setOptimisticLinks({ type: "DELETE", id });
      });

      const urlResult = updateUrlParams(id);

      try {
        const result = await deleteLink({ success: false, deletedId: "", error: "" }, id);

        if (result.success) {
          // Confirm the delete and update the actual links
          setActualLinks((currentLinks) => currentLinks.filter((link) => link.id !== id));
          deletedLinksRef.current.delete(id);
          toast.success("Link deleted successfully");
        } else {
          // Revert the optimistic delete
          const linkToRevert = deletedLinksRef.current.get(id);
          if (linkToRevert) {
            setOptimisticLinks({ type: "ADD", id, linkData: linkToRevert });
          }
          if (urlResult) rollbackUrlParams(urlResult.previousUrl);
          toast.error(result.error || "Failed to delete link");
        }
      } catch (error) {
        // Revert the optimistic delete
        console.log("Error deleting link:", error);
        const linkToRevert = deletedLinksRef.current.get(id);
        if (linkToRevert) {
          setOptimisticLinks({ type: "ADD", id, linkData: linkToRevert });
        }
        if (urlResult) rollbackUrlParams(urlResult.previousUrl);
        toast.error("An error occurred while deleting the link");
      } finally {
        // Always remove the link from pending deletes after the operation is complete
        pendingDeletesRef.current.delete(id);
      }
    },
    [links, setOptimisticLinks, setActualLinks, updateUrlParams, rollbackUrlParams],
  );

  return (
    <LinksContext.Provider
      value={{
        links,
        optimisticLinks,
        deleteLink: handleDeleteLink,
        setActualLinks,
      }}
    >
      {children}
    </LinksContext.Provider>
  );
}

export function useLinks() {
  const context = useContext(LinksContext);
  if (!context) {
    throw new Error("useLinks must be used within a LinksProvider");
  }
  return context;
}
