"use client";

import { useState } from "react";
import { wedding } from "@/config/wedding";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Photo } from "@/components/ui/Photo";
import { PinIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

/** Venue: postcard photo + map, "Getting here" tabs (air / train / road), stay & weather notes. */
export default function Venue() {
  const { venue, city, cityHi } = wedding;
  const [mode, setMode] = useState(0);
  const q = encodeURIComponent(venue.mapsQuery);

  return (
    <section id="venue" className="section">
      <SectionTitle hi="विवाह स्थल" eyebrow="Where in Kashi" title={venue.name} subtitle={venue.address} />

      <div className="grid gap-6 lg:grid-cols-5">
        <figure className="relative min-h-[320px] overflow-hidden rounded-[1.75rem] shadow-deep lg:col-span-2" data-reveal>
          <Photo src={venue.photo.src} alt={venue.photo.alt} fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-sindoor-900/90 via-sindoor-900/20 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 p-7 text-paper">
            <p className="hi text-2xl text-sona-300">{cityHi}</p>
            <p className="font-display text-4xl">{city}</p>
            <p className="mt-1 text-sm text-paper/80">On the ghats of the holy Ganga</p>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener noreferrer" className="btn-sona mt-5">
              <PinIcon className="h-4 w-4" /> Get directions
            </a>
          </figcaption>
        </figure>
        <div className="overflow-hidden rounded-[1.75rem] border border-sona-400/40 shadow-warm lg:col-span-3" data-reveal>
          <iframe title={`Map of ${venue.name}`} src={`https://maps.google.com/maps?q=${q}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-80 w-full border-0 lg:h-full lg:min-h-[420px]" allowFullScreen />
        </div>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-5">
        <div className="card p-7 lg:col-span-3" data-reveal>
          <p className="eyebrow">Getting here</p>
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Travel options">
            {venue.travel.map((t, i) => (
              <button
                key={t.mode}
                type="button"
                role="tab"
                aria-selected={mode === i}
                onClick={() => setMode(i)}
                className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-colors", mode === i ? "bg-sindoor-600 text-paper" : "bg-paper-200 text-sindoor-800 hover:bg-paper-300")}
              >
                <span aria-hidden>{t.icon}</span> {t.mode}
              </button>
            ))}
          </div>
          <p key={mode} className="mt-5 animate-fade-up text-lg leading-relaxed text-sindoor-900/80" role="tabpanel">
            {venue.travel[mode].text}
          </p>
        </div>
        <div className="grid gap-6 lg:col-span-2" data-reveal-stagger>
          <div className="card p-6">
            <p className="eyebrow">Stay</p>
            <p className="mt-2 text-sindoor-900/80">{venue.stay}</p>
          </div>
          <div className="card p-6">
            <p className="eyebrow">Weather</p>
            <p className="mt-2 text-sindoor-900/80">{venue.weather}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
