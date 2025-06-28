import Image from "next/image";
import { useRef, useState, forwardRef, useCallback, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";
import { ProfileServerState } from "@/lib/types";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadIcon } from "@/components/icons/upload-icon";

import { ImagePickerButton } from "./image-picker-button";
import { IMAGE_VALIDATION, ImageTypes } from "@/app/(main)/schema/profile-schema";

export type ImageFieldRef = {
  getSelectedFile: () => File | null;
  clearFile?: () => void;
};

type ImageFieldProps = {
  serverState?: ProfileServerState;
  isSubmitting?: boolean;
};

export const ProfileImageField = forwardRef<ImageFieldRef, ImageFieldProps>(
  ({ serverState, isSubmitting }, ref) => {
    const imageRef = useRef<HTMLInputElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState("");
    const [error, setError] = useState("");

    const isUploading = isSubmitting && !!selectedFile;

    useImperativeHandle(ref, () => ({
      getSelectedFile: () => selectedFile,
      clearFile: () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setExistingImageUrl("");
        setSelectedFile(null);
        setPreviewUrl(null);
        setError("");
        if (imageRef.current) imageRef.current.value = "";
      },
    }));

    const validateImage = useCallback((file: File) => {
      if (file.size > IMAGE_VALIDATION.MAX_SIZE) {
        return IMAGE_VALIDATION.MESSAGES.SIZE;
      }

      if (!IMAGE_VALIDATION.ALLOWED_TYPES.includes(file.type as ImageTypes)) {
        return IMAGE_VALIDATION.MESSAGES.TYPE;
      }

      return "";
    }, []);

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file && previewUrl) return;
        if (!file) {
          setSelectedFile(null);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
          setError("");
          return;
        }

        const hasValidationError = validateImage(file);
        setError(hasValidationError);

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        if (hasValidationError) {
          setSelectedFile(null);
          setPreviewUrl(null);
        } else {
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }
      },
      [previewUrl, validateImage],
    );

    const handleRemoveImage = () => {
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setError("");
      if (imageRef.current) imageRef.current.value = "";
    };

    const openImagePicker = () => {
      if (!imageRef.current || isUploading) return;
      imageRef.current.click();
      imageRef.current.value = "";
    };

    const serverError =
      serverState?.errors?.profileImage?.[0] ||
      (serverState?.data?.profileImage && serverState.message); // gets the error msg related to the image field
    const hasError = error || serverError;

    const displayedImage = previewUrl || existingImageUrl;

    return (
      <>
        {isSubmitting && !!selectedFile && (
          <div
            data-upload-overlay
            className="bg-foreground/30 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px]"
          >
            <Card className="items-center gap-3 p-6 shadow">
              <UploadIcon className="fill-primary size-10" />
              <div className="space-y-1 text-center">
                <p className="text-lg font-semibold">Updating Profile</p>
                <p className="text-accent-foreground text-sm">
                  Please wait, while we update your profile details.
                </p>
              </div>
            </Card>
          </div>
        )}
        <div className="@container">
          <Card className="bg-background gap-4 p-5 @xl:flex-row @xl:items-center @xl:justify-between">
            <p className="text-accent-foreground text-base @xl:min-w-40">Profile picture</p>
            <div className="flex flex-col gap-6 @xl:max-w-[432px] @xl:flex-row @xl:items-center">
              {displayedImage ? (
                <div className="relative">
                  <div className="group/image grid w-fit">
                    <Image
                      src={displayedImage}
                      alt="Profile preview image"
                      className="rounded-12 col-end-1 row-end-1 size-[193px] object-cover"
                      width={193}
                      height={193}
                    />
                    {!isUploading && (
                      <ImagePickerButton
                        variant="change"
                        onClick={openImagePicker}
                        className={cn(
                          "bg-foreground/5 text-primary-foreground hover:bg-foreground/15 col-end-1 row-end-1 opacity-0 group-hover/image:opacity-100",
                          "transition-opacity duration-200 ease-in-out",
                        )}
                      >
                        <span>Change Image</span>
                      </ImagePickerButton>
                    )}
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-muted text-destructive-foreground hover:bg-destructive text-primary-foreground absolute top-0 left-0 size-6 cursor-pointer items-center justify-center rounded-sm text-lg"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <ImagePickerButton
                    onClick={openImagePicker}
                    disabled={isUploading}
                    className={cn(
                      "bg-accent text-primary hover:bg-accent/80 active:border-primary focus-visible:outline-1 focus-visible:outline-offset-2 active:border-2 active:border-dashed disabled:cursor-not-allowed disabled:opacity-50",
                      hasError && "border-destructive border border-dashed",
                    )}
                  >
                    <span>+ Upload Image</span>
                  </ImagePickerButton>
                </div>
              )}
              <small className="text-xs">
                {hasError ? (
                  <span className="text-destructive">{error || serverError}</span>
                ) : (
                  <span className="text-accent-foreground">
                    Use image formats like .jpg, .jpeg, .png, .webp.
                  </span>
                )}
              </small>
            </div>
            <Input
              ref={imageRef}
              type="file"
              name="profileImage"
              form="profile-form"
              className="hidden"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              disabled={isUploading}
              onChange={handleFileChange}
            />
          </Card>
        </div>
      </>
    );
  },
);

ProfileImageField.displayName = "ProfileImageField";
