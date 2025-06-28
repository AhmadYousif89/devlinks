import { getProfileData } from "../actions/profile";
import { ProfileDetails } from "@/app/(main)/@profileDetails/_components/profile-details";

export default function ProfileDetailsSlot() {
  return <ProfileDetails profileDataPromise={getProfileData()} />;
}
