"use client";
import Link from "next/link";

import Logo from "public/assets/images/logo-devlinks-large.svg";

import { ErrorIcon } from "@/components/icons/error-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center">
      <header className="mb-8">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <Card className="border-destructive m-4 max-w-xl gap-5 border p-6">
        <div className="flex gap-1">
          <div className="self-start">
            <ErrorIcon />
          </div>
          <div>
            <div className="space-y-2 text-center">
              <h2 className="text-destructive text-lg font-semibold">
                An error occurred while processing your request. Please try again later.
              </h2>
              <p className="text-accent-foreground">
                {error.message || "An unexpected error occurred"}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 p-5 pb-0">
              <Button asChild className="min-h-12 min-w-32">
                <Link href="/">Return Home</Link>
              </Button>
              <Button variant="secondary" onClick={() => reset()} className="min-h-12 min-w-32">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
