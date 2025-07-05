"use client";

import Link from "next/link";
import { useRef } from "react";

import ShareLinkIcon from "public/assets/images/logo-devlinks-small.svg";

import { Button } from "@/components/ui/button";
import { CustomDialog, DialogRef } from "@/components/dialog-wrapper";

export const GuestSharePrompt = () => {
  const dialogRef = useRef<DialogRef>(null);

  const openDialog = () => {
    dialogRef.current?.open();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <Button onClick={openDialog} variant="secondary" className="h-11.5 w-40">
        Share Link 🔒
      </Button>

      <CustomDialog
        ref={dialogRef}
        className="p-6 text-center"
        ariaLabelby="Shareable Link Prompt"
        description="Signup to get a permanent, shareable link for your profile."
      >
        <div className="mb-4">
          <span className="mb-2 inline-grid size-10 place-content-center">
            <ShareLinkIcon className="scale-100" />
          </span>
          <h3 className="mb-2 text-lg font-semibold">Get Your Shareable Link!</h3>
          <p className="text-sm text-gray-600">
            Sign up to get a permanent, shareable link like:
            <br />
            <code className="mt-1 inline-block rounded bg-gray-100 px-2 py-1 text-xs">
              devlinks.app/preview/your-user-name
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
          onClick={closeDialog}
          className="text-accent-foreground w-fit self-center"
        >
          Maybe later
        </Button>
      </CustomDialog>
    </>
  );
};
