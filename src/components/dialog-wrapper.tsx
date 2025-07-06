import {
  ComponentProps,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";
import { createPortal } from "react-dom";

export type DialogRef = {
  open: () => void;
  close: () => void;
};

type DialogProps = {
  ariaLabelby?: string;
  description?: string;
  onClose?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
} & ComponentProps<"div">;

export const CustomDialog = forwardRef<DialogRef, DialogProps>(
  ({ children, className, onOpenChange, onClose, ariaLabelby, description, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const closeDialog = useCallback(() => {
      setIsOpen(false);
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      if (isOpen) onClose?.();
    }, [isOpen, onClose]);

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
        previousFocusRef.current = document.activeElement as HTMLElement;
      },
      close: closeDialog,
    }));

    useEffect(() => {
      onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

    // Handle Escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          closeDialog();
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }
    }, [closeDialog, isOpen]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
          closeDialog();
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen, closeDialog]);

    // Focus management
    useEffect(() => {
      if (isOpen && dialogRef.current) {
        // Focus the dialog or first focusable element
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, [isOpen]);

    // Prevent body scroll when dialog is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "unset";
        };
      }
    }, [isOpen]);

    if (!isOpen) return null;

    const dialogPortal = createPortal(
      <div className="bg-foreground/25 fixed inset-0 z-50 m-0 flex max-h-none max-w-none items-center justify-center">
        <Card
          ref={dialogRef}
          role="dialog"
          tabIndex={-1}
          aria-modal="true"
          aria-labelledby={ariaLabelby || "dialog-title"}
          aria-describedby={description || "dialog-description"}
          className={cn("w-full max-w-2xl max-sm:mx-4", className)}
          {...props}
        >
          {children}
        </Card>
      </div>,
      document.body,
    );

    return dialogPortal;
  },
);

CustomDialog.displayName = "CustomDialog";
