import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_MAX_AGE,
  ADMIN_COOKIE_NAME,
  LEGACY_ACCESS_COOKIE_NAMES,
  PROFILE_COOKIE_NAME,
  createAccessToken,
  isSiteAccessCode,
  safeRedirectPath
} from "@/lib/access/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const code = String(formData.get("code") ?? "");
  const requestedNext = safeRedirectPath(String(formData.get("next") ?? "/"));

  if (!isSiteAccessCode(code)) {
    const url = new URL("/access", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", requestedNext);

    return NextResponse.redirect(url);
  }

  const response = NextResponse.redirect(new URL("/profiles", request.url));
  LEGACY_ACCESS_COOKIE_NAMES.forEach((name) => response.cookies.delete(name));
  response.cookies.delete(ADMIN_COOKIE_NAME);
  response.cookies.delete(PROFILE_COOKIE_NAME);
  response.cookies.set(ACCESS_COOKIE_NAME, await createAccessToken(), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_MAX_AGE
  });

  return response;
}
