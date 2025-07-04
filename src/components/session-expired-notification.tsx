"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";
import { ErrorCard } from "./layout/error";
import { UserSession } from "@/lib/types";
import { Dialog } from "./dialog-wrapper";
import { useClearHighlightParams } from "@/hooks/use-clear-highlight-params";

type Props = {
  getUserSession: Promise<UserSession>;
};

export default function SessionExpiredNotification({ getUserSession }: Props) {
  const router = useRouter();
  const session = use(getUserSession);
  const [isDismissed, setIsDismissed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const clearHighlightParams = useClearHighlightParams();

  useEffect(() => {
    if (session && "expired" in session) {
      clearHighlightParams();
    }
  }, [session, clearHighlightParams]);

  const closeModal = () => {
    setIsDismissed(true);
    dialogRef.current?.close();
  };

  const handleCloseDialog = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      closeModal();
    }
  };

  // Show notification only if session has expired flag
  if (!session || !("expired" in session) || isDismissed) {
    return null;
  }

  return (
    <Dialog ref={dialogRef} onClick={handleCloseDialog} onClose={closeModal}>
      <ErrorCard
        title="Session Expired"
        message="Your session has expired. Please login again to continue where you left off."
        actions={
          <>
            <Button onClick={() => router.push("/signin")} className="min-w-28">
              Sign In
            </Button>
            <Button variant="destructive" onClick={() => setIsDismissed(true)} className="min-w-28">
              Dismiss
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
