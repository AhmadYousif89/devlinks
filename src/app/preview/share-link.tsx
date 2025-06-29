"use client";

import { toast } from "sonner";

import SaveToclipboardIcon from "public/assets/images/icon-link-copied-to-clipboard.svg";

import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";

type ShareLinkProps = {
  user: User | null;
};

export const ShareLink = ({ user }: ShareLinkProps) => {
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

  return (
    <Button onClick={handleLinkShare} className="h-11.5 w-40">
      Share Link
    </Button>
  );
};
