import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_MAX_AGE,
  ADMIN_COOKIE_NAME,
  PROFILE_COOKIE_NAME
} from "@/lib/access/session";
import { isProfileKey } from "@/lib/profiles";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const profile = String(formData.get("profile") ?? "");

  if (!isProfileKey(profile)) {
    return NextResponse.redirect(new URL("/profiles", request.url));
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(ADMIN_COOKIE_NAME);
  response.cookies.set(PROFILE_COOKIE_NAME, profile, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_MAX_AGE
  });

  return response;
}
