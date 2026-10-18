"use client";

import { useState } from "react";
import { wedding } from "@/config/wedding";
import { formatDayMonth, formatTime } from "@/lib/date";
import { downloadAllIcs, downloadIcs, googleCalendarUrl } from "@/lib/calendar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Photo } from "@/components/ui/Photo";
import { CalendarIcon, ClockIcon, PinIcon, ShirtIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

/**
 * Celebrations as expanding photo panels: on desktop a horizontal accordion
 * (the open panel grows, the others become slim tabs with vertical titles);
 * on phones a vertical accordion. Plus "Add all events" in one tap.
 */
export default function Events() {
  const events = wedding.events;
  const [open, setOpen] = useState(events.findIndex((e) => e.id === "pheras"));

  return (
    <section id="events" className="section">
      <SectionTitle hi="मांगलिक कार्यक्रम" eyebrow="The celebrations" title="Five days of festivities" subtitle="Tap a ceremony to see the details, or add every event to your calendar at once." />

      <div className="mb-8 flex justify-center" data-reveal>
        <button type="button" onClick={() => downloadAllIcs(events)} className="btn-sindoor">
          <CalendarIcon className="h-4 w-4" /> Add all {events.length} events to my calendar
        </button>
      </div>

      <div className="flex flex-col gap-3 md:h-[620px] md:flex-row" data-reveal>
        {events.map((e, i) => {
          const isOpen = open === i;
          const { day, month, weekday } = formatDayMonth(e.start);
          return (
            <article
              key={e.id}
              className={cn(
                "group relative overflow-hidden rounded-[1.75rem] text-paper shadow-warm transition-[flex-grow,height] duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
                isOpen ? "h-[560px] md:h-auto md:flex-[5]" : "h-[76px] md:h-auto md:flex-[0.75]"
              )}
            >
              <Photo src={e.photo.src} alt={e.photo.alt} fill sizes="(max-width:768px) 100vw, 60vw" className={cn("object-cover transition-transform duration-[1.2s]", isOpen ? "scale-100" : "scale-110")} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${e.accent}F2 0%, ${e.accent}99 35%, rgba(20,6,4,0.35) 100%)` }} />

              {/* collapsed header: tap target */}
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-expanded={isOpen}
                aria-controls={`ev-${e.id}`}
                className={cn("absolute inset-0 flex items-center gap-3 px-5 text-left md:flex-col md:justify-end md:px-0 md:pb-6", isOpen && "pointer-events-none opacity-0")}
              >
                <span className="font-display text-2xl md:text-xl">{day}</span>
                <span className="font-display text-xl md:hidden">{e.name}</span>
                <span className="hi ml-auto text-sm text-paper/85 md:hidden">{e.hi}</span>
                <span className="hidden whitespace-nowrap font-display text-xl [writing-mode:vertical-rl] md:block md:rotate-180">{e.name}</span>
              </button>

              {/* expanded content */}
              <div id={`ev-${e.id}`} className={cn("absolute inset-0 flex flex-col justify-end p-6 transition-opacity duration-500 sm:p-8", isOpen ? "opacity-100 delay-200" : "pointer-events-none opacity-0")}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="hi text-xl text-paper/90">{e.hi}</p>
                    <h3 className="font-display text-4xl leading-tight sm:text-5xl">{e.name}</h3>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-paper/95 px-4 py-2 text-center text-sindoor-800">
                    <p className="font-display text-3xl leading-none">{day}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em]">{month}</p>
                  </div>
                </div>
                <p className="mt-3 max-w-lg text-paper/90">{e.description}</p>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">When</dt>
                    <ClockIcon className="h-4 w-4 shrink-0" />
                    <dd>
                      {weekday.slice(0, 3)}, {formatTime(e.start)} – {formatTime(e.end)}
                    </dd>
                  </div>
                  <div className="flex items-start gap-2">
                    <dt className="sr-only">Where</dt>
                    <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    <dd>{e.venue}</dd>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <dt className="sr-only">Dress code</dt>
                    <ShirtIcon className="h-4 w-4 shrink-0" />
                    <dd className="flex items-center gap-2">
                      {e.dressCode}
                      <span className="flex -space-x-1" aria-hidden>
                        {e.palette.map((c) => (
                          <span key={c} className="h-4 w-4 rounded-full border-2 border-paper" style={{ background: c }} />
                        ))}
                      </span>
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="btn-line-light" tabIndex={isOpen ? 0 : -1}>
                    <CalendarIcon className="h-4 w-4" /> Google
                  </a>
                  <button type="button" onClick={() => downloadIcs(e)} className="btn-line-light" tabIndex={isOpen ? 0 : -1}>
                    <CalendarIcon className="h-4 w-4" /> Apple / Outlook
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
