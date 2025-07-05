import { getProfileData } from "../actions/profile";
import { ProfileDetails } from "@/app/(main)/@profileDetails/_components/profile-details";

export default async function ProfileDetailsSlot() {
  const profilePromise = getProfileData();

  return <ProfileDetails profileDataPromise={profilePromise} />;
}
