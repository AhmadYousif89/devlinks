"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";

import { UserSession } from "@/lib/types";
import { ErrorIcon } from "./icons/error-icon";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type Props = {
  getUserSession: Promise<UserSession>;
};

export default function SessionExpiredNotification({ getUserSession }: Props) {
  const router = useRouter();
  const session = use(getUserSession);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show notification only if session has expired flag
  if (!session || !("expired" in session) || isDismissed) {
    return null;
  }

  return (
    <div className="bg-foreground/25 fixed inset-0 z-50 flex items-center justify-center">
      <Card className="border-destructive max-w-sm border p-5 shadow-lg">
        <div className="flex">
          <div>
            <ErrorIcon />
          </div>
          <div className="ml-3 space-y-4">
            <h3 className="text-destructive font-semibold">Session Expired</h3>
            <p className="text-destructive/90 text-sm">
              Your session has expired. Please sign in again to continue.
            </p>
            <div className="flex justify-between space-x-2">
              <Button onClick={() => router.push("/signin")} className="min-w-28">
                Sign In
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDismissed(true)}
                className="min-w-28"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
