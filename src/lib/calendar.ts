import type { WeddingEvent } from "@/config/wedding";
import { wedding } from "@/config/wedding";

/** ISO → 20270122T140000Z (UTC basic format used by Google Calendar and .ics) */
const toUtcStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const title = (e: WeddingEvent) => `${e.name} · ${wedding.bride.firstName} & ${wedding.groom.firstName}`;
const details = (e: WeddingEvent) => `${e.description}\nDress code: ${e.dressCode}\n${wedding.hashtag}`;

export function googleCalendarUrl(e: WeddingEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title(e),
    dates: `${toUtcStamp(e.start)}/${toUtcStamp(e.end)}`,
    details: details(e),
    location: `${e.venue}, ${e.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Escape text per RFC 5545 */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

const vevent = (e: WeddingEvent) => [
  "BEGIN:VEVENT",
  `UID:${e.id}-${toUtcStamp(e.start)}@wedding-invite`,
  `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
  `DTSTART:${toUtcStamp(e.start)}`,
  `DTEND:${toUtcStamp(e.end)}`,
  `SUMMARY:${esc(title(e))}`,
  `DESCRIPTION:${esc(details(e))}`,
  `LOCATION:${esc(`${e.venue}, ${e.address}`)}`,
  "BEGIN:VALARM",
  "TRIGGER:-PT3H",
  "ACTION:DISPLAY",
  `DESCRIPTION:${esc(title(e))}`,
  "END:VALARM",
  "END:VEVENT",
];

function download(events: WeddingEvent[], filename: string) {
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...events.flatMap(vevent), "END:VCALENDAR"].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** One event as an .ics file (Apple Calendar, Outlook, most Android calendars). */
export const downloadIcs = (e: WeddingEvent) => download([e], `${e.id}.ics`);

/** Every ceremony in a single .ics file: one tap adds the whole wedding to a calendar. */
export const downloadAllIcs = (events: WeddingEvent[]) =>
  download(events, `${wedding.bride.firstName}-${wedding.groom.firstName}-wedding.ics`.toLowerCase());
