import { getUserSession } from "@/app/(auth)/_lib/session";
import { getProfileData } from "../actions/profile";
import { ProfileDetails } from "@/app/(main)/@profileDetails/_components/profile-details";

export default async function ProfileDetailsSlot() {
  // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay for suspense
  const profilePromise = getProfileData();
  const sessionPromise = getUserSession();

  return <ProfileDetails profileDataPromise={profilePromise} sessionPromise={sessionPromise} />;
}
