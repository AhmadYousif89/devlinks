import { cn } from "@/lib/utils";
import UploadImageIcon from "public/assets/images/icon-upload-image.svg";

type ImagePickerButtonProps = {
  variant?: "upload" | "change";
} & React.ComponentProps<"button">;

export const ImagePickerButton = ({
  children,
  className,
  onClick,
  variant = "upload",
  ...props
}: ImagePickerButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-12 flex size-[193px] cursor-pointer flex-col items-center justify-center gap-2 font-semibold",
        "aria-invalid:border-destructive aria-invalid:bg-destructive/10 aria-invalid:border aria-invalid:border-dashed",
        className,
      )}
      {...props}
    >
      <UploadImageIcon className={variant === "change" ? "fill-primary-foreground" : ""} />
      {children}
    </button>
  );
};
