import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfileKey } from "@/lib/access/server";
import {
  ACCESS_MAX_AGE,
  ADMIN_COOKIE_NAME,
  createAdminToken,
  safeRedirectPath
} from "@/lib/access/session";
import { isAdminPasswordForProfile } from "@/lib/profiles.server";

export async function POST(request: NextRequest) {
  const wantsJson = request.headers.get("x-eikon-fetch") === "1";
  const profileKey = await getCurrentProfileKey();

  if (!profileKey) {
    if (wantsJson) {
      return NextResponse.json({ error: "Profilo richiesto" }, { status: 400 });
    }

    return NextResponse.redirect(new URL("/profiles", request.url));
  }

  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const nextPath = safeRedirectPath(String(formData.get("next") ?? "/admin"), "/admin");

  if (!isAdminPasswordForProfile(profileKey, password)) {
    if (wantsJson) {
      return NextResponse.json({ error: "Password non valida" }, { status: 401 });
    }

    const url = new URL("/admin/login", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url);
  }

  const response = wantsJson
    ? NextResponse.json({ ok: true, next: nextPath })
    : NextResponse.redirect(new URL(nextPath, request.url));

  response.cookies.set(ADMIN_COOKIE_NAME, await createAdminToken(profileKey), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_MAX_AGE
  });

  return response;
}
