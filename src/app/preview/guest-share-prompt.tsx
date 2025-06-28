"use client";

import Link from "next/link";
import { useState } from "react";

import ShareLinkIcon from "public/assets/images/logo-devlinks-small.svg";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const GuestSharePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowPrompt(true)}
        variant="secondary"
        className="h-11.5 w-40"
      >
        Share Link 🔒
      </Button>

      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 text-center">
            <div className="mb-4">
              <span className="mb-2 inline-grid size-10 place-content-center">
                <ShareLinkIcon className="scale-100" />
              </span>
              <h3 className="mb-2 text-lg font-semibold">
                Get Your Shareable Link!
              </h3>
              <p className="text-sm text-gray-600">
                Sign up to get a permanent, shareable link like:
                <br />
                <code className="mt-1 inline-block rounded bg-gray-100 px-2 py-1 text-xs">
                  devlinks.app/your-user-name
                </code>
              </p>
            </div>

            <div className="mb-4 flex gap-4">
              <Button asChild className="min-h-12 flex-1">
                <Link href="/signup">Sign Up Free</Link>
              </Button>
              <Button asChild variant="secondary" className="min-h-12 flex-1">
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowPrompt(false)}
              className="text-accent-foreground w-fit self-center"
            >
              Maybe later
            </Button>
          </Card>
        </div>
      )}
    </>
  );
};
