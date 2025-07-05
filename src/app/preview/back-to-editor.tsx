"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export const BackToEditor = () => {
  const searchParams = useSearchParams();

  const buildURL = () => {
    const params = new URLSearchParams(searchParams.toString());
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : "/";
  };

  return (
    <Button asChild variant="secondary" className="h-11.5 w-40">
      <Link href={buildURL()}>
        <span>Back to Editor</span>
      </Link>
    </Button>
  );
};
