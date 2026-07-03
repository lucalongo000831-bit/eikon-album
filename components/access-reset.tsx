"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const INTERNAL_NAVIGATION_KEY = "eikon_internal_navigation";

export function AccessReset() {
  const pathname = usePathname();

  useEffect(() => {
    window.sessionStorage.removeItem(INTERNAL_NAVIGATION_KEY);

    if (pathname.startsWith("/access")) {
      return;
    }

    const markInternalNavigation = () => {
      window.sessionStorage.setItem(INTERNAL_NAVIGATION_KEY, "1");
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest("a");

      if (!link || link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }

      try {
        const href = new URL(link.href);

        if (href.origin === window.location.origin) {
          markInternalNavigation();
        }
      } catch {
        markInternalNavigation();
      }
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;

      if (!form) {
        return;
      }

      const action = form.getAttribute("action");

      if (!action) {
        markInternalNavigation();
        return;
      }

      try {
        const url = new URL(action, window.location.href);

        if (url.origin === window.location.origin) {
          markInternalNavigation();
        }
      } catch {
        markInternalNavigation();
      }
    };

    const clearAccess = () => {
      if (window.sessionStorage.getItem(INTERNAL_NAVIGATION_KEY) === "1") {
        return;
      }

      document.cookie = "eikon_access=; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = "eikon_access_once=; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = "eikon_profile=; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = "eikon_admin_profile=; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = "eikon_access=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "eikon_access_once=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "eikon_profile=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "eikon_admin_profile=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener("pagehide", clearAccess);
    window.addEventListener("beforeunload", clearAccess);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener("pagehide", clearAccess);
      window.removeEventListener("beforeunload", clearAccess);
    };
  }, [pathname]);

  return null;
}
