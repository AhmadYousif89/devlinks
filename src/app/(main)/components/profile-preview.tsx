import Image from "next/image";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

import { getProfileData } from "../actions/profile";
import { ProfileInfoSkeleton } from "../skeletons/profile-info-skeleton";
import { ProfileImageSkeleton } from "../skeletons/profile-image-skeleton";

type Props = { inPreviewPage?: boolean };

const ProfileImage = async ({ inPreviewPage = false }: Props) => {
  const user = await getProfileData();

  return (
    <div className={cn("bg-border/40 rounded-full", inPreviewPage ? "size-26" : "size-24")}>
      {user?.image ? (
        <Image
          src={user.image}
          width={400}
          height={400}
          alt="Profile image"
          className={cn(
            "ring-primary rounded-full object-cover ring-4",
            inPreviewPage ? "size-26" : "size-24",
          )}
        />
      ) : null}
    </div>
  );
};

const ProfileInfo = async ({ inPreviewPage = false }: Props) => {
  const user = await getProfileData();
  const username = user?.firstName + " " + user?.lastName;

  return (
    <div className={cn("flex flex-col items-center", user ? "gap-2" : "gap-3.25")}>
      {user ? (
        <h2
          title={username}
          className={cn(
            "max-w-[220px] truncate",
            inPreviewPage ? "text-[32px] font-bold" : "text-[18px] font-semibold",
          )}
        >
          {username}
        </h2>
      ) : (
        <span className="bg-border/40 h-4 w-40 rounded-full" />
      )}
      {user?.displayEmail ? (
        <p
          title={user.displayEmail}
          className={cn(
            "max-w-[180px] truncate",
            "text-accent-foreground",
            inPreviewPage ? "text-[16px]" : "text-[14px]",
          )}
        >
          {user.displayEmail}
        </p>
      ) : (
        <span className="bg-border/40 h-2 w-18 rounded-full" />
      )}
    </div>
  );
};

export const ProfilePreview = ({ inPreviewPage = false }: Props) => {
  return (
    <section className="flex flex-col items-center gap-6.25">
      <Suspense fallback={<ProfileImageSkeleton inPreviewPage={inPreviewPage} />}>
        <ProfileImage inPreviewPage={inPreviewPage} />
      </Suspense>
      <Suspense fallback={<ProfileInfoSkeleton />}>
        <ProfileInfo inPreviewPage={inPreviewPage} />
      </Suspense>
    </section>
  );
};
