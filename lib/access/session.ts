import type { NextRequest } from "next/server";
import { isProfileKey, type ProfileKey } from "@/lib/profiles";

export type AccessRole = "viewer";

export const ACCESS_COOKIE_NAME = "eikon_access_once";
export const ADMIN_COOKIE_NAME = "eikon_admin_profile";
export const PROFILE_COOKIE_NAME = "eikon_profile";
export const LEGACY_ACCESS_COOKIE_NAMES = ["eikon_access"];
export const ACCESS_MAX_AGE = 60 * 60;

type AccessPayload = {
  role: AccessRole;
  exp: number;
};

type AdminPayload = {
  role: "profile_admin";
  profileKey: ProfileKey;
  exp: number;
};

function viewerCode() {
  return process.env.SITE_ACCESS_CODE ?? "0831";
}

function sessionSecret() {
  return (
    process.env.ACCESS_SESSION_SECRET ??
    [
      viewerCode(),
      process.env.ADMIN_PASSWORD_LUCA ?? process.env.ADMIN_ACCESS_CODE ?? "14052005",
      process.env.ADMIN_PASSWORD_RACHELE ?? "1",
      process.env.ADMIN_PASSWORD_EMANUELE ?? "2",
      "eikon-private-album"
    ].join(":")
  );
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

  if (typeof atob === "function") {
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }

  return Uint8Array.from(Buffer.from(padded, "base64"));
}

async function sign(value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return toBase64Url(new Uint8Array(signature));
}

function sameSignature(a: string, b: string) {
  const left = fromBase64Url(a);
  const right = fromBase64Url(b);

  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }

  return diff === 0;
}

export function isSiteAccessCode(code: string) {
  return code.trim() === viewerCode();
}

export async function createAccessToken() {
  const payload: AccessPayload = {
    role: "viewer",
    exp: Math.floor(Date.now() / 1000) + ACCESS_MAX_AGE
  };
  const encodedPayload = toBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAccessToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await sign(encodedPayload);

  try {
    if (!sameSignature(signature, expectedSignature)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encodedPayload))
    ) as AccessPayload;

    if (
      payload.role !== "viewer" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload.role;
  } catch {
    return null;
  }
}

export async function getRequestAccessRole(request: NextRequest) {
  return verifyAccessToken(request.cookies.get(ACCESS_COOKIE_NAME)?.value);
}

export async function createAdminToken(profileKey: ProfileKey) {
  const payload: AdminPayload = {
    role: "profile_admin",
    profileKey,
    exp: Math.floor(Date.now() / 1000) + ACCESS_MAX_AGE
  };
  const encodedPayload = toBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await sign(encodedPayload);

  try {
    if (!sameSignature(signature, expectedSignature)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encodedPayload))
    ) as AdminPayload;

    if (
      payload.role !== "profile_admin" ||
      !isProfileKey(payload.profileKey) ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload.profileKey;
  } catch {
    return null;
  }
}

export function getRequestProfileKey(request: NextRequest) {
  const value = request.cookies.get(PROFILE_COOKIE_NAME)?.value;

  return isProfileKey(value) ? value : null;
}

export async function getRequestAdminProfileKey(request: NextRequest) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

export function safeRedirectPath(value: string | null, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
