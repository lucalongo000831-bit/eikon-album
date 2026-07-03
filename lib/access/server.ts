import { cookies } from "next/headers";
import { isProfileKey, type ProfileKey } from "@/lib/profiles";
import {
  ACCESS_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  PROFILE_COOKIE_NAME,
  verifyAccessToken,
  verifyAdminToken
} from "./session";

export async function getCurrentAccessRole() {
  const cookieStore = await cookies();
  return verifyAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
}

export async function getCurrentProfileKey() {
  const cookieStore = await cookies();
  const value = cookieStore.get(PROFILE_COOKIE_NAME)?.value;

  return isProfileKey(value) ? value : null;
}

export async function getCurrentAdminProfileKey() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function isCurrentAdminForProfile(profileKey?: ProfileKey | null) {
  const selectedProfile = profileKey ?? (await getCurrentProfileKey());
  const adminProfile = await getCurrentAdminProfileKey();

  return Boolean(selectedProfile && adminProfile === selectedProfile);
}

export async function isCurrentAdmin() {
  return isCurrentAdminForProfile();
}
