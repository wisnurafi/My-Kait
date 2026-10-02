import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a random slug for share links.
 * Uses crypto.randomUUID and takes first segment for shortness.
 */
export function generateSlug(): string {
  const uuid = crypto.randomUUID();
  // Take 12 chars from the UUID (enough entropy to be unguessable)
  return uuid.replace(/-/g, "").slice(0, 12);
}

/**
 * Format a date according to locale.
 */
export function formatDate(date: Date | string, locale: string = "id"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const loc = locale === "en" ? "en-US" : "id-ID";
  return d.toLocaleString(loc, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time ("2 menit lalu" / "2 minutes ago").
 */
export function formatRelativeTime(date: Date | string, locale: string = "id"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (locale === "en") {
    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
  if (seconds < 60) return "baru saja";
  if (minutes < 60) return `${minutes} mnt lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
}

/**
 * Truncate text.
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

/**
 * Sleep helper (for dev/testing).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
