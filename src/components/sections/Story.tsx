"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { wedding } from "@/config/wedding";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Photo } from "@/components/ui/Photo";
import { cn } from "@/lib/cn";

/** Our story: each photo opens through a circular iris as it scrolls in, text slides from the side. */
export default function Story() {
  const { stage, reducedMotion } = useExperience();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (stage !== "open" || reducedMotion) return;
      gsap.utils.toArray<HTMLElement>(".st-row").forEach((row, i) => {
        const st = { trigger: row, start: "top 85%", end: "center 55%", scrub: 0.6 };
        gsap.fromTo(row.querySelector(".st-photo"), { clipPath: "circle(8% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", ease: "none", scrollTrigger: st });
        gsap.fromTo(row.querySelector(".st-img"), { scale: 1.4, rotate: i % 2 ? 6 : -6 }, { scale: 1, rotate: 0, ease: "none", scrollTrigger: st });
        gsap.from(row.querySelector(".st-text"), { x: i % 2 ? -50 : 50, opacity: 0, ease: "none", scrollTrigger: st });
      });
    },
    { scope: root, dependencies: [stage, reducedMotion] }
  );

  return (
    <section ref={root} id="story" className="section">
      <SectionTitle hi="हमारी कहानी" eyebrow="How it began" title="Our story" />
      <div className="space-y-20 md:space-y-28">
        {wedding.story.map((c, i) => (
          <article key={c.title} className="st-row grid items-center gap-8 md:grid-cols-2 md:gap-16">
            <div className={cn("relative mx-auto aspect-square w-full max-w-md", i % 2 && "md:order-2")}>
              {/* rotating dashed gold halo */}
              <div className="absolute -inset-4 animate-spin-slow rounded-full border-2 border-dashed border-sona-400/60" aria-hidden />
              <div className="st-photo relative h-full w-full overflow-hidden rounded-full shadow-deep">
                <div className="st-img absolute inset-0">
                  <Photo src={c.photo.src} alt={c.photo.alt} fill sizes="(max-width:768px) 90vw, 28rem" className="object-cover" />
                </div>
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-sindoor-600 px-4 py-1.5 font-display text-sm text-paper shadow-warm">{c.date}</span>
            </div>
            <div className={cn("st-text text-center md:text-left", i % 2 && "md:order-1 md:text-right")}>
              <p className="font-display text-6xl text-kesar-400/60">0{i + 1}</p>
              <h3 className="mt-2 font-display text-3xl text-sindoor-800 sm:text-4xl">{c.title}</h3>
              <p className="mt-4 text-lg leading-relaxed text-sindoor-900/75">{c.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
