"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";

import { User } from "@/lib/types";
import { validateUserInfo } from "./actions/preview";
import SaveToclipboardIcon from "public/assets/images/icon-link-copied-to-clipboard.svg";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/dialog-wrapper";
import { ErrorCard } from "@/components/layout/error";
import { ButtonWithFormState } from "@/components/button-with-formstate";

type ShareLinkProps = {
  user: User | null;
};

export type ShareLinkState = {
  isValid: boolean;
  missingInfo: string[];
  emptyLinkIds?: string[];
};

const initialState: ShareLinkState = {
  isValid: false,
  missingInfo: [],
  emptyLinkIds: [],
};

export const ShareLink = ({ user }: ShareLinkProps) => {
  const [state, formAction, isPending] = useActionState(validateUserInfo, initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  const hasValidated = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!hasValidated.current && user) {
      hasValidated.current = true;
      startTransition(() => {
        formAction(user);
      });
    }
  }, [formAction, user]);

  const handleLinkShare = async () => {
    try {
      const currentUrl = window.location.href;
      const constructSharableLink = `${currentUrl}/${user?.username}/?id=${user?.id}`;
      await navigator.clipboard?.writeText(constructSharableLink);

      toast("The link has been copied to your clipboard!", {
        icon: <SaveToclipboardIcon />,
      });
    } catch (err) {
      console.error("Failed to copy link: ", err);
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handleBackToEditor = () => {
    const params = new URLSearchParams();

    if (state.missingInfo.length === 1 && state.missingInfo.includes("Missing Profile Image")) {
      params.set("v", "details");
      params.set("highlight", "image");
    } else if (state.missingInfo.includes("Missing Profile Image")) {
      params.set("highlight", "image");
    }

    if (state.emptyLinkIds && state.emptyLinkIds.length > 0) {
      params.set("highlight-links", state.emptyLinkIds.join(","));
    }

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    modalRef.current?.close();
  };

  const handleSubmit = async () => {
    if (state.isValid) {
      await handleLinkShare();
    } else {
      setIsModalOpen(true);
      modalRef.current?.showModal();
    }
  };

  const handleShareAnyway = async () => {
    await handleLinkShare();
    handleCloseModal();
  };

  const handleDialogClose = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      handleCloseModal();
    }
  };

  return (
    <>
      {!state.isValid && state.missingInfo.length > 0 && isModalOpen && (
        <Dialog ref={modalRef} onClick={handleDialogClose} onClose={handleCloseModal}>
          <ErrorCard
            className="relative"
            title="Missing Information"
            message="You have some missing information about your dev links!"
            actions={
              <>
                <Button
                  variant="secondary"
                  onClick={handleBackToEditor}
                  className="h-11.5 min-w-40 text-xs max-sm:min-w-20"
                >
                  Back To Editor
                </Button>
                <ButtonWithFormState
                  variant="destructive"
                  onClick={handleShareAnyway}
                  className="h-11.5 min-w-40 text-xs max-sm:min-w-20"
                >
                  Share My Link Anyway
                </ButtonWithFormState>
              </>
            }
          >
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseModal}
                aria-label="Close modal"
                className="absolute top-3 right-3 size-6 text-xl"
              >
                &times;
              </Button>
              <ul className="space-y-2">
                {state.missingInfo.map((info, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-amber-700" />
                    <span className="text-amber-700">{info}</span>
                  </li>
                ))}
              </ul>
            </>
          </ErrorCard>
        </Dialog>
      )}
      <Button disabled={isPending} onClick={handleSubmit} className="h-11.5 w-40">
        {isPending ? "Validating..." : "Share Link"}
      </Button>
    </>
  );
};
