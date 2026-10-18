"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { wedding } from "@/config/wedding";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Photo } from "@/components/ui/Photo";
import { cn } from "@/lib/cn";

const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

/**
 * Gallery: three columns of jharokha-arched photos that drift at different
 * speeds as you scroll (the middle column moves against the others).
 * Tap any photo for the lightbox.
 */
export default function Gallery() {
  const { stage, reducedMotion } = useExperience();
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const photos = wedding.gallery;
  const cols = [0, 1, 2].map((c) => photos.map((p, i) => ({ p, i })).filter(({ i }) => i % 3 === c));

  useGSAP(
    () => {
      if (stage !== "open" || reducedMotion) return;
      [-8, 8, -4].forEach((y, c) => {
        gsap.fromTo(`.gal-col-${c}`, { yPercent: 0 }, { yPercent: y, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      });
    },
    { scope: root, dependencies: [stage, reducedMotion] }
  );

  return (
    <section ref={root} id="gallery" className="relative z-10 overflow-hidden bg-paper-200 py-24 md:py-32">
      <div className="px-5">
        <SectionTitle hi="यादें" eyebrow="Moments & details" title="The gallery" />
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 sm:gap-5 md:grid-cols-3">
        {cols.map((col, c) => (
          <div key={c} className={cn(`gal-col-${c} flex flex-col gap-3 sm:gap-5`, c === 2 && "hidden md:flex", c === 1 && "pt-16")}>
            {col.map(({ p, i }) => (
              <button
                key={p.src}
                type="button"
                onClick={() => setOpen(i)}
                className="group relative overflow-hidden rounded-t-full border-4 border-paper-100 bg-paper-300 shadow-warm"
                style={{ aspectRatio: `${p.width} / ${Math.max(p.height, p.width * 1.15)}` }}
                aria-label={`Open photo: ${p.alt}`}
              >
                <Photo src={p.src} alt={p.alt} fill sizes="(max-width:768px) 50vw, 33vw" loading="lazy" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-sindoor-900/85 to-transparent p-3 pt-8 text-left text-sm text-paper transition-transform duration-500 group-hover:translate-y-0">{p.alt}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      {/* on phones the third column's photos join the first two */}
      <div className="mx-auto mt-3 grid max-w-6xl grid-cols-2 gap-3 px-4 md:hidden">
        {cols[2].map(({ p, i }) => (
          <button key={p.src} type="button" onClick={() => setOpen(i)} className="relative aspect-[3/4] overflow-hidden rounded-t-full border-4 border-paper-100 shadow-warm" aria-label={`Open photo: ${p.alt}`}>
            <Photo src={p.src} alt={p.alt} fill sizes="50vw" loading="lazy" className="object-cover" />
          </button>
        ))}
      </div>
      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
