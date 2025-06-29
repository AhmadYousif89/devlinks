"use client";

import Form from "next/form";
import { toast } from "sonner";
import { useActionState, useEffect, useRef } from "react";

import SaveIcon from "public/assets/images/icon-changes-saved.svg";

import { UserProfileDisplay } from "@/lib/types";
import { updateProfile } from "@/app/(main)/actions/profile";
import { ProfileServerState } from "../../schema/profile-schema";

import { ProfileInputFields } from "./input-fields";
import { ImageFieldRef, ProfileImageField } from "./image-field";

import { Spinner } from "@/components/icons/spinner";
import { ButtonWithFormState } from "@/components/button-with-formstate";

const INTIAL_STATE: ProfileServerState = {
  success: false,
  message: "",
};

type ProfileDetailsProps = {
  profileDataPromise: Promise<UserProfileDisplay | null>;
};

export const ProfileDetails = ({ profileDataPromise }: ProfileDetailsProps) => {
  const [state, formAction, isPending] = useActionState(updateProfile, INTIAL_STATE);
  const imageFieldRef = useRef<ImageFieldRef>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Your changes have been successfully saved!", {
        icon: <SaveIcon />,
      });
      imageFieldRef.current?.clearFile?.();
    }
  }, [state]);

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
        <ProfileImageField ref={imageFieldRef} serverState={state} isSubmitting={isPending} />
        <ProfileInputFields serverState={state} profileDataPromise={profileDataPromise} />
      </div>

      <Form
        id="profile-form"
        action={handleSubmit}
        formEncType="multipart/form-data"
        className="border-border mt-auto flex items-center justify-center border-t p-4"
      >
        <ButtonWithFormState
          className="h-11.5 w-full text-base font-semibold md:ml-auto md:w-22.75"
          actionLoader={<Spinner className="fill-accent size-8" />}
        >
          Save
        </ButtonWithFormState>
      </Form>
    </>
  );
};
