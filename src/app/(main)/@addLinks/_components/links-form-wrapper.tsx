"use client";

import Form from "next/form";
import { startTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { updateLinkForm } from "../../actions/links";
import { useClearHighlightParams } from "@/hooks/use-clear-highlight-params";

type LinksFormWrapperProps = {
  formId: string;
  children: React.ReactNode;
  className?: string;
};

export const LinksFormWrapper = ({ children, formId, className }: LinksFormWrapperProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const faultyLinkIds = useMemo(
    () => searchParams.get("highlight-links")?.split(",") || [],
    [searchParams],
  );
  const clearHighlightParams = useClearHighlightParams();

  const handleFormSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateLinkForm(formData);

      if (result?.success && faultyLinkIds.length > 0) {
        // We need to get fresh data from the form to check current URLs
        const currentFormData = new FormData(document.getElementById(formId) as HTMLFormElement);
        const entries = Object.fromEntries(currentFormData.entries());

        const fixedLinkIds: string[] = [];

        // Check each faulty link to see if it now has a URL
        faultyLinkIds.forEach((linkId) => {
          const urlKey = `url-${linkId}`;
          const urlValue = entries[urlKey] as string;

          if (urlValue && urlValue.trim() !== "") {
            fixedLinkIds.push(linkId);
          }
        });

        // If any highlighted links were fixed, update the URL params
        if (fixedLinkIds.length > 0) {
          const remainingFaultyLinks = faultyLinkIds.filter((id) => !fixedLinkIds.includes(id));

          if (remainingFaultyLinks.length === 0) {
            // All highlighted links were fixed, clear the param
            clearHighlightParams("LINKS");
          } else {
            // Update param with remaining faulty links
            const url = new URL(window.location.href);
            const params = new URLSearchParams(url.search);
            params.set("highlight-links", remainingFaultyLinks.join(","));
            const newUrl = `${url.pathname}?${params.toString()}`;
            console.log("Updating URL with remaining faulty links:", newUrl);
            router.replace(newUrl);
          }
        }
      }
    });
  };

  return (
    <Form id={formId} action={handleFormSubmit} className={className}>
      {children}
    </Form>
  );
};
