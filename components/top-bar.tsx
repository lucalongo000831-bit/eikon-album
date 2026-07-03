"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getProfileByKey, type Profile } from "@/lib/profiles";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Ricordi", href: "/" },
  { label: "Viaggi", href: "/?category=viaggi" },
  { label: "Anni", href: "/?view=years" },
  { label: "Persone", href: "/?category=persone" },
  { label: "Album", href: "/" }
];

function formatDate(date: Date) {
  const dayMonth = new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long"
  }).format(date);

  const time = new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  return `${dayMonth}, ${time}`;
}

function selectedProfileFromCookie() {
  const profileCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("eikon_profile="));

  if (!profileCookie) {
    return null;
  }

  return getProfileByKey(decodeURIComponent(profileCookie.split("=")[1] ?? ""));
}

export function TopBar() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const isAccessScreen = pathname.startsWith("/access");

  useEffect(() => {
    const update = () => setCurrentTime(formatDate(new Date()));
    update();
    const timer = window.setInterval(update, 1000 * 20);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAccessScreen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setSelectedProfile(selectedProfileFromCookie());
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isAccessScreen, pathname]);

  if (isAccessScreen) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-[52px] items-center justify-between border-b border-neutral-200 bg-white px-4 text-[15px] text-neutral-900 md:px-5">
      <div className="flex min-w-0 items-center gap-6">
        <Link
          href="/"
          className="shrink-0 font-editorial text-[17px] uppercase leading-none"
          aria-label="Torna alla home"
        >
          EIKON
        </Link>
        <nav className="hidden items-center gap-5 text-[15px] md:flex" aria-label="Menu principale">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "leading-none text-neutral-800 transition hover:text-black",
                pathname !== "/" && item.href === "/" ? "text-neutral-500" : ""
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-[13px] text-neutral-800">
        {selectedProfile ? (
          <>
            <span className="hidden uppercase sm:inline">
              Profilo: {selectedProfile.name}
            </span>
            <Link href="/profiles" className="uppercase transition hover:text-black">
              Cambia profilo
            </Link>
            <Link href="/admin" className="uppercase transition hover:text-black">
              Modifica
            </Link>
          </>
        ) : null}
        <time className="hidden text-right text-[14px] text-neutral-800 md:block" suppressHydrationWarning>
          {currentTime || " "}
        </time>
      </div>
    </header>
  );
}
