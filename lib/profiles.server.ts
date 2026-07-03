import type { ProfileKey } from "@/lib/profiles";

export function getAdminPasswordForProfile(profileKey: ProfileKey) {
  if (profileKey === "rachele") {
    return process.env.ADMIN_PASSWORD_RACHELE ?? "1";
  }

  if (profileKey === "emanuele") {
    return process.env.ADMIN_PASSWORD_EMANUELE ?? "2";
  }

  return process.env.ADMIN_PASSWORD_LUCA ?? process.env.ADMIN_ACCESS_CODE ?? "14052005";
}

export function isAdminPasswordForProfile(profileKey: ProfileKey, password: string) {
  return password.trim() === getAdminPasswordForProfile(profileKey);
}
