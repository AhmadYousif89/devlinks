"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";
import { Spinner } from "./icons/spinner";
import { Button } from "./ui/button";

type ButtonWithFormStateProps = {
  isLoading?: boolean;
  actionLoader?: React.ReactNode;
} & React.ComponentProps<typeof Button>;

export const ButtonWithFormState = ({
  children,
  className,
  actionLoader,
  disabled,
  isLoading = false,
  ...props
}: ButtonWithFormStateProps) => {
  const { pending } = useFormStatus();

  const loadingContent = actionLoader ? actionLoader : <Spinner className="size-8" />;
  const isPending = isLoading || pending;

  return (
    <Button
      type="submit"
      aria-busy={isPending}
      disabled={disabled || isPending}
      aria-disabled={disabled || isPending}
      className={cn("focus-visible:shadow-custom w-fit", className)}
      {...props}
    >
      {isPending ? loadingContent : children}
    </Button>
  );
};
