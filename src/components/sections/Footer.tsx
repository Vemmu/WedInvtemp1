"use client";

import { useState } from "react";
import { wedding } from "@/config/wedding";
import { formatLongDate } from "@/lib/date";
import { downloadAllIcs } from "@/lib/calendar";
import { Toran } from "@/components/ui/Toran";
import { PhoneIcon, WhatsAppIcon, CalendarIcon } from "@/components/ui/Icons";

/** Footer: toran, the elders' blessing, monogram, hashtag, contacts, all-events calendar. */
export default function Footer() {
  const [copied, setCopied] = useState(false);
  const { footer, initials, hashtag, contacts, bride, groom, weddingDate, city, events } = wedding;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hashtag);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <footer className="band-sindoor relative overflow-hidden pb-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))]">
      <Toran className="w-full" strands={15} />
      <div className="mx-auto max-w-3xl px-5 pt-10 text-center">
        <p className="hi text-4xl text-sona-300 sm:text-5xl" data-reveal>
          {footer.blessing}
        </p>
        <p className="mt-2 text-sm italic text-paper/70">{footer.blessingMeaning}</p>

        <div className="mx-auto mt-12 flex h-28 w-28 items-center justify-center rounded-full border-2 border-sona-400 bg-sindoor-900/40 shadow-sona" data-reveal>
          <span className="font-display text-4xl text-sona-300">
            {initials.bride}
            <span className="text-kesar-400">&amp;</span>
            {initials.groom}
          </span>
        </div>
        <p className="mx-auto mt-8 max-w-lg text-paper/80">{footer.thankYou}</p>
        <p className="mt-4 font-display text-4xl">
          {bride.firstName} &amp; {groom.firstName}
        </p>
        <p className="hi text-xl text-sona-300">
          {bride.hi} &amp; {groom.hi}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={copy} className="btn-line-light" aria-live="polite">
            {copied ? "Copied!" : hashtag}
          </button>
          <button type="button" onClick={() => downloadAllIcs(events)} className="btn-line-light">
            <CalendarIcon className="h-4 w-4" /> Save all dates
          </button>
        </div>

        <p className="eyebrow mt-16 !text-kesar-300">For any help</p>
        <ul className="mx-auto mt-5 grid max-w-2xl gap-4 sm:grid-cols-2">
          {contacts.map((c) => {
            const digits = c.phone.replace(/\D/g, "");
            return (
              <li key={c.phone} className="rounded-[1.5rem] border border-sona-400/30 bg-sindoor-900/40 p-5">
                <p className="font-display text-xl">{c.name}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-paper/55">{c.role}</p>
                <div className="mt-4 flex justify-center gap-2">
                  <a href={`tel:+${digits}`} className="btn-line-light !px-4">
                    <PhoneIcon className="h-4 w-4" /> {c.phone}
                  </a>
                  <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="btn-line-light !px-3" aria-label={`WhatsApp ${c.name}`}>
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-12 text-[10px] uppercase tracking-[0.35em] text-paper/45">
          {formatLongDate(weddingDate)} · {city}
        </p>
      </div>
    </footer>
  );
}
