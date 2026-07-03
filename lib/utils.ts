import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clampPercent(value: number | null | undefined, fallback: number) {
  const next = typeof value === "number" ? value : fallback;
  return Math.min(86, Math.max(4, next));
}
