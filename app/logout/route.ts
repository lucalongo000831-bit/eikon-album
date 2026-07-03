import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  LEGACY_ACCESS_COOKIE_NAMES,
  PROFILE_COOKIE_NAME
} from "@/lib/access/session";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/access", request.url));
  response.cookies.delete(ACCESS_COOKIE_NAME);
  response.cookies.delete(ADMIN_COOKIE_NAME);
  response.cookies.delete(PROFILE_COOKIE_NAME);
  LEGACY_ACCESS_COOKIE_NAMES.forEach((name) => response.cookies.delete(name));

  return response;
}
