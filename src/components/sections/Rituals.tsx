"use client";

import { useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Photo } from "@/components/ui/Photo";
import { ChevronIcon } from "@/components/ui/Icons";

/**
 * "Know the rituals": a swipeable shelf of cards explaining each ceremony,
 * a friendly guide for guests attending a Hindu wedding for the first time.
 */
export default function Rituals() {
  const shelf = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const items = wedding.rituals;

  const nudge = (dir: 1 | -1) => shelf.current?.scrollBy({ left: dir * shelf.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section id="rituals" className="band-sindoor overflow-hidden py-24 md:py-32">
      <div className="px-5">
        <SectionTitle light hi="रीति-रिवाज" eyebrow="A guide for our guests" title="Know the rituals" subtitle="New to a Hindu wedding? Here's what you'll see, and why it matters to us." />
      </div>
      <div
        ref={shelf}
        onScroll={(e) => {
          const el = e.currentTarget;
          setProgress(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth));
        }}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[6vw] pb-4"
        tabIndex={0}
        aria-label="Wedding rituals"
      >
        {items.map((r, i) => (
          <article key={r.name} className="group w-[78vw] max-w-[340px] shrink-0 snap-center overflow-hidden rounded-[1.75rem] bg-paper-100 text-sindoor-900 shadow-deep">
            <div className="relative h-52 overflow-hidden">
              <Photo src={r.photo.src} alt={r.photo.alt} fill sizes="340px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-sindoor-600 font-display text-paper">{i + 1}</span>
            </div>
            <div className="p-6">
              <p className="hi text-xl text-kesar-600">{r.hi}</p>
              <h3 className="font-display text-2xl text-sindoor-800">{r.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-sindoor-900/75">{r.text}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-6 flex max-w-md items-center gap-4 px-6">
        <button type="button" onClick={() => nudge(-1)} className="btn-line-light h-10 w-10 !p-0" aria-label="Previous rituals">
          <ChevronIcon className="h-4 w-4 rotate-180" />
        </button>
        <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-paper/20">
          <span className="absolute inset-y-0 left-0 rounded-full bg-kesar-400" style={{ width: `${12 + progress * 88}%` }} />
        </span>
        <button type="button" onClick={() => nudge(1)} className="btn-line-light h-10 w-10 !p-0" aria-label="More rituals">
          <ChevronIcon className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
