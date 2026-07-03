import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ACCESS_COOKIE_NAME,
  LEGACY_ACCESS_COOKIE_NAMES,
  PROFILE_COOKIE_NAME,
  getRequestAccessRole,
  getRequestAdminProfileKey,
  getRequestProfileKey
} from "@/lib/access/session";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublicPath =
    pathname.startsWith("/access") ||
    pathname.startsWith("/_next") ||
    pathname === "/logout" ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/apple-icon.svg" ||
    pathname === "/eikon-mark.svg";

  if (!isPublicPath) {
    const role = await getRequestAccessRole(request);
    const isProfilesPath = pathname.startsWith("/profiles");
    const isAdminLoginPath = pathname.startsWith("/admin/login");
    const needsAdmin = pathname.startsWith("/admin") && !isAdminLoginPath;

    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/access";
      url.search = "";
      url.searchParams.set("next", `${pathname}${search}`);

      const redirect = NextResponse.redirect(url);
      redirect.cookies.delete(ACCESS_COOKIE_NAME);
      redirect.cookies.delete(ADMIN_COOKIE_NAME);
      redirect.cookies.delete(PROFILE_COOKIE_NAME);
      LEGACY_ACCESS_COOKIE_NAMES.forEach((name) => redirect.cookies.delete(name));

      return redirect;
    }

    const selectedProfile = getRequestProfileKey(request);

    if (!selectedProfile && !isProfilesPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/profiles";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (needsAdmin) {
      const adminProfile = await getRequestAdminProfileKey(request);

      if (!selectedProfile || adminProfile !== selectedProfile) {
        const url = request.nextUrl.clone();
        url.pathname = selectedProfile ? "/admin/login" : "/profiles";
        url.search = "";
        url.searchParams.set("next", `${pathname}${search}`);
        return NextResponse.redirect(url);
      }
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      }
    }
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
