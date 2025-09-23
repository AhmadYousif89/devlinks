"use client";

import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { use, useActionState, useEffect, useMemo, useRef } from "react";

import SaveIcon from "public/assets/images/icon-changes-saved.svg";

import { toast } from "sonner";
import { UserProfileDisplay, UserSession } from "@/lib/types";
import { updateProfile } from "@/app/(main)/actions/profile";
import { ProfileServerState } from "../../schema/profile.schema";

import { ProfileInputFields } from "./input-fields";
import { ImageFieldRef, ProfileImageField } from "./image-field";

import { Spinner } from "@/components/icons/spinner";
import { HighlightBanner } from "@/components/highlight-banner";
import { ButtonWithFormState } from "@/components/button-with-formstate";
import { useClearHighlightParams } from "@/hooks/use-clear-highlight-params";

const INTIAL_STATE: ProfileServerState = {
  success: false,
  message: "",
};

type ProfileDetailsProps = {
  profileDataPromise: Promise<UserProfileDisplay | null>;
  sessionPromise: Promise<UserSession | null>;
};

export const ProfileDetails = ({ profileDataPromise, sessionPromise }: ProfileDetailsProps) => {
  const session = use(sessionPromise);
  const imageFieldRef = useRef<ImageFieldRef>(null);
  const [state, formAction, isPending] = useActionState(updateProfile, INTIAL_STATE);
  const searchParams = useSearchParams();

  const clearHighlightParams = useClearHighlightParams();
  const highlightImage = useMemo(() => searchParams.get("highlight") === "image", [searchParams]);

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message, { icon: <SaveIcon /> });
      imageFieldRef.current?.clearFile?.();
      if (state.imageUploaded) {
        clearHighlightParams("PROFILE");
      }
    }
  }, [state, clearHighlightParams]);

  const handleSubmit = (formData: FormData) => {
    const selectedFile = imageFieldRef.current?.getSelectedFile();
    if (selectedFile && selectedFile.size > 0) formData.set("image", selectedFile);
    else formData.delete("image");

    formAction(formData);
  };

  return (
    <>
      <div className="space-y-6 p-6 md:p-10">
        <header className="mb-10 flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Profile Details</h2>
          <p className="text-accent-foreground">
            Add your details to create a personal touch to your profile.
          </p>
        </header>
        {/* Show warning banner if profile items need highlighting */}
        {highlightImage && (
          <HighlightBanner
            area="PROFILE"
            title="Profile Information Missing"
            description="Please complete the highlighted profile fields below."
          />
        )}
        <ProfileImageField
          ref={imageFieldRef}
          serverState={state}
          isSubmitting={isPending}
          isMissingImage={highlightImage}
        />
        <ProfileInputFields serverState={state} profileDataPromise={profileDataPromise} />
      </div>

      <Form
        id="profile-form"
        action={handleSubmit}
        className="border-border mt-auto flex items-center justify-center border-t p-4"
      >
        <ButtonWithFormState
          disabled={session?.expired || isPending}
          className="h-11.5 w-full text-base font-semibold md:ml-auto md:w-22.75"
          actionLoader={<Spinner className="fill-accent size-8" />}
        >
          Save
        </ButtonWithFormState>
      </Form>
    </>
  );
};
