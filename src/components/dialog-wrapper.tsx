import { cn } from "@/lib/utils";

type DialogProps = {} & React.ComponentProps<"dialog">;

export const Dialog = ({ children, className, ...props }: DialogProps) => {
  return (
    <dialog
      className={cn(
        "bg-foreground/25 fixed inset-0 z-50 m-0 flex size-full max-h-none max-w-none items-center justify-center backdrop:bg-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </dialog>
  );
};
