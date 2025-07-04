"use client";

import { useState, useEffect, useRef } from "react";

import { markGuestAsNotified } from "@/app/(main)/actions/profile";
import { XIcon } from "./icons/x-icon";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog } from "./dialog-wrapper";

type Props = {
  status: "should-show" | "already-notified" | "no-guest";
};

export function GuestWelcomeNotification({ status }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (status === "should-show") {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [status]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isVisible) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isVisible]);

  const handleClose = async () => {
    setIsVisible(false);
    dialogRef.current?.close();
    await markGuestAsNotified();
  };

  const handleDialogClose = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  if (status !== "should-show" || !isVisible) return null;

  return (
    <Dialog ref={dialogRef} onClose={handleClose} onClick={handleDialogClose}>
      <Card className="relative mx-4 max-w-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <div className="flex size-8 items-center justify-center self-center rounded-full bg-amber-100">
            ⏰
          </div>
          <div>
            <h3 id="modal-title" className="font-semibold text-amber-700">
              Welcome, fellow developer!
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              We are delighted to have you here! As a guest, your progress will be saved
              temporarily.
              <br />
              <strong> Your data will be automatically deleted after a period of time.</strong>
            </p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-full bg-amber-100">
            💡
          </div>
          <p className="mt-2 flex flex-col gap-1 text-sm text-amber-700">
            <span>
              <strong>Tip: </strong>Create an account to save your links permanently and access them
              anytime!
            </span>
          </p>
          <Button
            variant="ghost"
            onClick={handleClose}
            aria-label="Close notification"
            className="absolute top-2 right-2 size-8 !p-0"
          >
            <XIcon className="text-accent-foreground" />
          </Button>
        </div>
      </Card>
    </Dialog>
  );
}
