"use client";

import dynamic from "next/dynamic";
import { memo, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { wedding } from "@/config/wedding";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { Photo } from "@/components/ui/Photo";
import { cn } from "@/lib/cn";

// Memoised so caption state never re-renders the 3D scene.
const PheraScene = memo(dynamic(() => import("@/components/three/PheraScene"), { ssr: false }));

// keep in sync with PHERA_START / PHERA_END in PheraScene
const START = 0.04;
const END = 0.92;

/** Seven diyas; each lights up as its phera completes. */
function DiyaRow({ lit }: { lit: number }) {
  return (
    <div className="flex items-end justify-center gap-2.5" aria-label={`${lit} of 7 pheras complete`}>
      {Array.from({ length: 7 }).map((_, i) => (
        <span key={i} className="relative flex flex-col items-center">
          <span
            className={cn(
              "mb-0.5 h-3 w-2 rounded-[50%_50%_50%_50%/70%_70%_30%_30%] transition-all duration-500",
              i < lit ? "animate-flicker bg-gradient-to-t from-kesar-500 to-haldi-300 shadow-[0_0_14px_4px_rgba(255,170,60,0.6)]" : "scale-50 bg-paper/20"
            )}
          />
          <span className="h-2 w-5 rounded-b-full bg-gradient-to-b from-[#C9622F] to-[#8A3B17]" />
        </span>
      ))}
    </div>
  );
}

/**
 * Saat Phere: the section pins for ~4 screens while the 3D couple circle the
 * sacred fire seven times. Each round reveals one of the Saptapadi vows.
 */
export default function Pheras() {
  const { stage, quality, reducedMotion } = useExperience();
  const is2d = quality === "2d";
  const root = useRef<HTMLElement>(null);
  const progress = useRef(reducedMotion ? 1 : 0);
  const [p, setP] = useState(reducedMotion ? 1 : 0);
  const { vows } = wedding;

  useGSAP(
    () => {
      if (stage !== "open" || is2d) return;
      if (reducedMotion) {
        progress.current = 1;
        setP(1);
        return;
      }
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=400%",
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
          setP(Math.round(self.progress * 200) / 200);
        },
      });
      return () => st.kill();
    },
    // Only 2D vs 3D matters here. A runtime high→low quality drop must NOT re-create the
    // pin mid-scroll (that re-measures the start while pinned and releases the pin early).
    { dependencies: [stage, reducedMotion, is2d] }
  );

  const fallbackPhoto = wedding.events.find((e) => e.id === "pheras")!.photo;

  /* 2D fallback: the seven vows as a list over a photo */
  if (quality === "2d") {
    return (
      <section id="pheras" className="band-sindoor">
        <div className="section">
          <p className="hi text-center text-xl text-sona-300">सात फेरे</p>
          <h2 className="mt-2 text-center font-display text-5xl">Saat Phere</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-paper/75">Seven rounds around the sacred fire, and seven vows for a lifetime together.</p>
          <ol className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {vows.map((v, i) => (
              <li key={v.title} className="rounded-2xl border border-sona-400/30 bg-sindoor-900/40 p-5">
                <p className="hi text-sona-300">{v.hi}</p>
                <p className="font-display text-xl">
                  {i + 1}. {v.title}
                </p>
                <p className="mt-1 text-sm text-paper/75">{v.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  const walk = Math.min(1, Math.max(0, (p - START) / (END - START)));
  const lit = Math.min(7, Math.floor(walk * 7 + 0.0001));
  const current = Math.min(6, Math.floor(walk * 7));
  const finale = p > END;
  const intro = p < START;
  const vow = vows[current];

  const sceneFallback = (
    <div className="absolute inset-0">
      <Photo src={fallbackPhoto.src} alt={fallbackPhoto.alt} fill sizes="100vw" className="object-cover opacity-50" />
    </div>
  );

  return (
    <section ref={root} id="pheras" className="relative z-10 h-[100svh] overflow-hidden bg-[#1A0A08] text-paper">
      <PheraScene progress={progress} fallback={sceneFallback} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(26,10,8,0.85))]" />

      <div className="pointer-events-none absolute inset-x-0 top-[max(1.5rem,env(safe-area-inset-top))] px-5 text-center">
        <p className="hi text-lg text-sona-300">सात फेरे · सप्तपदी</p>
        <p className="font-display text-2xl sm:text-3xl">Saat Phere</p>
        <div className="mt-3">
          <DiyaRow lit={finale ? 7 : lit} />
        </div>
      </div>

      {/* vow card */}
      <div className="pointer-events-none absolute inset-x-4 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5rem))] mx-auto max-w-md">
        {intro ? (
          <div className="animate-fade-up rounded-2xl border border-sona-400/30 bg-sindoor-900/60 p-5 text-center backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-kesar-300">Scroll to begin</p>
            <p className="mt-2 font-display text-xl">Tied by the gathbandhan, the couple circle Agni, the sacred fire, seven times.</p>
          </div>
        ) : finale ? (
          <div key="finale" className="animate-fade-up rounded-2xl border border-sona-400/40 bg-sindoor-900/60 p-6 text-center backdrop-blur-md">
            <p className="hi text-4xl text-sona-300">शुभ विवाह</p>
            <p className="mt-2 font-display text-2xl">Bound for seven lifetimes</p>
            <p className="mt-1 text-sm text-paper/75">Please shower the couple with your blessings 🌼</p>
          </div>
        ) : (
          <div key={current} className="animate-fade-up rounded-2xl border border-sona-400/30 bg-sindoor-900/60 p-5 backdrop-blur-md">
            <div className="flex items-baseline justify-between gap-3">
              <p className="hi text-lg text-sona-300">{vow.hi}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-kesar-300">Phera {current + 1} of 7</p>
            </div>
            <p className="mt-1 font-display text-2xl">{vow.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-paper/80">{vow.text}</p>
            {current === 3 && <p className="mt-2 text-[11px] italic text-kesar-300/90">The groom now leads the remaining rounds.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
