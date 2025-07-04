"use client";
import Link from "next/link";

import Logo from "public/assets/images/logo-devlinks-large.svg";
import { ErrorCard } from "@/components/layout/error";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center">
      <header className="mb-8">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <ErrorCard
        title="An error occurred while processing your request."
        message={error.message || "An unexpected error occurred"}
        actions={
          <>
            <Button asChild className="min-h-12 min-w-30">
              <Link href="/">Return Home</Link>
            </Button>
            <Button variant="secondary" onClick={() => reset()} className="min-h-12 min-w-30">
              Try Again
            </Button>
          </>
        }
      />
    </section>
  );
}
