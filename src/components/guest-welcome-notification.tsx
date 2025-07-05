"use client";

import { useCallback, useEffect, useRef } from "react";

import { markGuestAsNotified } from "@/app/(main)/actions/profile";
import { CustomDialog, DialogRef } from "./dialog-wrapper";

type Props = {
  status: "should-show" | "already-notified" | "no-guest";
};

export function GuestWelcomeNotification({ status }: Props) {
  const dialogRef = useRef<DialogRef>(null);

  useEffect(() => {
    if (status === "should-show") {
      dialogRef.current?.open();
    }
  }, [status]);

  const handleNotifyGuest = useCallback(() => markGuestAsNotified(), []);

  if (status === "no-guest") return null;

  return (
    <CustomDialog
      ref={dialogRef}
      onClose={handleNotifyGuest}
      ariaLabelby="Welcome Guest"
      description="Welcome to DevLinks! As a guest, your progress will be saved temporarily. Create an account to save your links permanently."
      className="border border-amber-200 bg-amber-50 p-5"
    >
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        <div className="flex size-8 items-center justify-center self-center rounded-full bg-amber-100">
          ⏰
        </div>
        <div>
          <h3 id="modal-title" className="font-semibold text-amber-700">
            Welcome, to DevLinks!
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            We are delighted to have you here! As a guest, your progress will be saved temporarily.
            <br />
            <strong> Your data will be automatically deleted after a period of time.</strong>
          </p>
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-amber-100">💡</div>
        <p className="mt-2 flex flex-col gap-1 text-sm text-amber-700">
          <span>
            <strong>Tip: </strong>Create an account to save your links permanently and access them
            anytime!
          </span>
        </p>
      </div>
    </CustomDialog>
  );
}
