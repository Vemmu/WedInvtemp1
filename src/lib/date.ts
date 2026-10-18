import { wedding } from "@/config/wedding";

/**
 * Date helpers. Everything is formatted in the wedding's timezone so the server
 * render and every guest's phone show identical text (no hydration mismatch).
 */
const tz = wedding.timeZone;

export const formatLongDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz }).format(new Date(iso));

export const formatShortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: tz }).format(new Date(iso));

export const formatDayMonth = (iso: string) => {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat("en-IN", { day: "2-digit", timeZone: tz }).format(d),
    month: new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: tz }).format(d),
    weekday: new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: tz }).format(d),
  };
};

export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz })
    .format(new Date(iso))
    .toUpperCase();

/** "22 · 01 · 2027" style date for the hero */
export const formatDotDate = (iso: string) => {
  const parts = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: tz })
    .formatToParts(new Date(iso))
    .filter((p) => p.type !== "literal")
    .map((p) => p.value);
  return parts.join(" · ");
};
