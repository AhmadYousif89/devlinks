"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-center"
      style={
        {
          "--normal-bg": "var(--foreground)",
          "--normal-text": "var(--primary-foreground)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
