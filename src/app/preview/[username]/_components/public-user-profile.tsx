import Image from "next/image";

import { PublicUserProfile } from "@/lib/types";

type Props = { user: PublicUserProfile };

export const UserPublicProfile = ({ user }: Props) => {
  return (
    <section className="flex flex-col items-center gap-6.25">
      <div className="bg-border/40 size-26 rounded-full">
        {user.image ? (
          <Image
            src={user.image}
            width={400}
            height={400}
            alt="Profile image"
            className="ring-primary size-26 rounded-full object-cover ring-4"
          />
        ) : null}
      </div>
      <div className="flex flex-col items-center gap-2">
        {user ? (
          <h2 title={user.username} className="max-w-[220px] truncate text-[32px] font-bold">
            {user.username}
          </h2>
        ) : (
          <span className="bg-border/40 h-4 w-40 rounded-full" />
        )}
        {user ? (
          <p
            title={user.displayEmail}
            className="text-accent-foreground max-w-[180px] truncate text-[16px]"
          >
            <a href={`mailto:${user.displayEmail}`}>{user.displayEmail}</a>
          </p>
        ) : (
          <span className="bg-border/40 h-2 w-18 rounded-full" />
        )}
      </div>
    </section>
  );
};
