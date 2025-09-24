import { getUserSession } from "@/app/(auth)/_lib/session";
import { getProfileData } from "../@profileDetails/_dal/read.dal";
import { ProfileDetails } from "@/app/(main)/@profileDetails/_components/profile-details";

export default async function ProfileDetailsSlot() {
  const profile = await getProfileData();
  const session = await getUserSession();

  return <ProfileDetails profileData={profile} session={session} />;
}
