export const profiles = [
  {
    key: "luca",
    name: "LUCA",
    color: "black"
  },
  {
    key: "rachele",
    name: "RACHELE",
    color: "pink"
  },
  {
    key: "emanuele",
    name: "EMANUELE",
    color: "blue"
  }
] as const;

export type Profile = (typeof profiles)[number];
export type ProfileKey = Profile["key"];

export function isProfileKey(value: unknown): value is ProfileKey {
  return profiles.some((profile) => profile.key === value);
}

export function getProfileByKey(value: unknown): Profile | null {
  return profiles.find((profile) => profile.key === value) ?? null;
}
