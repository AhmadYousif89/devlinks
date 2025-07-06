"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useRef } from "react";

import { Button } from "./ui/button";
import { UserSession } from "@/lib/types";
import { WarningCard } from "./layout/warning";
import { CustomDialog, DialogRef } from "./dialog-wrapper";
import { useClearHighlightParams } from "@/hooks/use-clear-highlight-params";

type Props = {
  getUserSession: Promise<UserSession>;
};

export default function SessionExpiredNotification({ getUserSession }: Props) {
  const router = useRouter();
  const session = use(getUserSession);
  const dialogRef = useRef<DialogRef>(null);
  const clearHighlightParams = useClearHighlightParams();

  useEffect(() => {
    if (session && "expired" in session) {
      clearHighlightParams();
      dialogRef.current?.open();
    }
  }, [session, clearHighlightParams]);

  const closeModal = () => {
    dialogRef.current?.close();
  };

  // Show notification only if session has expired flag
  if (!session || !("expired" in session)) return null;

  return (
    <CustomDialog
      ref={dialogRef}
      ariaLabelby="Session Expired"
      description="Your session has expired. Please login again to continue where you left off."
      className="border-destructive/80 w-auto border p-5 shadow-lg"
    >
      <WarningCard
        title="Session Expired"
        message="Your session has expired. Please login again to continue where you left off."
        actions={
          <>
            <Button onClick={() => router.push("/signin")} className="min-w-28">
              Sign In
            </Button>
            <Button variant="destructive" onClick={closeModal} className="min-w-28">
              Dismiss
            </Button>
          </>
        }
      />
    </CustomDialog>
  );
}
