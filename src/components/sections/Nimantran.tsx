"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { wedding } from "@/config/wedding";
import { formatLongDate, formatTime } from "@/lib/date";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { Motif } from "@/components/ui/SectionTitle";

/** Wooden scroll rod with gold finials */
function Rod({ className = "" }: { className?: string }) {
  return (
    <div className={`relative z-10 mx-auto h-5 w-[calc(100%+2.5rem)] -translate-x-5 rounded-full bg-gradient-to-b from-[#8A4B22] via-[#B56A35] to-[#5E3216] shadow-warm ${className}`}>
      <span className="absolute -left-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-gradient-to-br from-sona-300 to-sona-600 shadow" />
      <span className="absolute -right-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-gradient-to-br from-sona-300 to-sona-600 shadow" />
    </div>
  );
}

/**
 * Nimantran Patra: the traditional invitation as a paper scroll that unrolls
 * as it scrolls into view, opening with
 * the Ganesh vandana and listing the hosts, Swagatkarta and Darshanabhilashi.
 */
export default function Nimantran() {
  const { stage, reducedMotion } = useExperience();
  const root = useRef<HTMLElement>(null);
  const { nimantran: n, shloka, bride, groom, weddingDate, muhuratNote, venue, invitation } = wedding;

  useGSAP(
    () => {
      if (stage !== "open" || reducedMotion) return;
      // No pinning (the paper is taller than a phone screen): the paper unrolls as it
      // scrolls through the viewport, and the bottom rod rides the unrolling edge.
      const paper = root.current!.querySelector(".scroll-paper") as HTMLElement;
      const rod = root.current!.querySelector(".scroll-rod-bottom") as HTMLElement;
      const st = { trigger: paper, start: "top 72%", end: "bottom 88%", scrub: 0.5, invalidateOnRefresh: true };
      gsap.fromTo(paper, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", ease: "none", scrollTrigger: st });
      gsap.fromTo(rod, { y: () => -paper.offsetHeight }, { y: 0, ease: "none", scrollTrigger: st });
    },
    { scope: root, dependencies: [stage, reducedMotion] }
  );

  return (
    <section ref={root} id="nimantran" className="relative z-10 flex justify-center overflow-hidden bg-paper-200 px-6 py-24">
      {/* soft mandala watermark */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[140vmin] w-[140vmin] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full opacity-[0.07] [background:repeating-conic-gradient(#B3001B_0_6deg,transparent_6deg_15deg)]" aria-hidden />

      <div className="relative w-full max-w-xl">
        <Rod />
        <div className="scroll-paper relative -mt-2 rounded-sm border-x-4 border-sona-400/50 bg-[linear-gradient(180deg,#FFF6E3,#FBEBCB)] px-6 pb-10 pt-10 text-center shadow-deep sm:px-12">
          <div className="pointer-events-none absolute inset-3 border border-sona-500/40" aria-hidden />
          <p className="scroll-line hi text-3xl text-sindoor-600">ॐ</p>
          <p className="scroll-line hi mt-2 whitespace-pre-line text-lg leading-relaxed text-sindoor-800">{shloka.text}</p>
          <p className="scroll-line mx-auto mt-2 max-w-sm text-xs italic text-sindoor-900/60">{shloka.meaning}</p>
          <Motif className="scroll-line mx-auto my-5 w-32 text-kesar-500" />
          <p className="scroll-line hi text-2xl text-sindoor-700">{n.hi}</p>
          <p className="scroll-line mt-3 text-sm text-sindoor-900/75">{n.intro}</p>
          <p className="scroll-line mt-2 font-display text-xl text-sindoor-800">{n.hosts}</p>
          <p className="scroll-line mt-2 text-sm text-sindoor-900/75">{n.request}</p>
          <p className="scroll-line mt-5 font-display text-4xl text-sindoor-600 sm:text-5xl">{bride.fullName}</p>
          <p className="scroll-line hi my-1 text-xl text-kesar-600">संग</p>
          <p className="scroll-line font-display text-4xl text-sindoor-600 sm:text-5xl">{groom.fullName}</p>
          <p className="scroll-line mt-1 text-xs text-sindoor-900/60">{n.groomLine}</p>
          <div className="scroll-line mx-auto mt-6 inline-block rounded-xl border border-sona-500/50 bg-paper-100/70 px-5 py-3">
            <p className="font-display text-lg text-sindoor-800">{formatLongDate(weddingDate)}</p>
            <p className="text-sm text-sindoor-900/70">
              {formatTime(weddingDate)} · {venue.name}, {wedding.city}
            </p>
            <p className="mt-1 text-[11px] text-kesar-600">{muhuratNote}</p>
          </div>
          <p className="scroll-line mx-auto mt-6 max-w-sm text-sm italic text-sindoor-900/70">{n.closing}</p>
          <div className="scroll-line mt-6 grid gap-4 text-left text-xs text-sindoor-900/75 sm:grid-cols-2">
            <div>
              <p className="hi text-base text-sindoor-700">स्वागतकर्ता</p>
              <p className="eyebrow !text-[9px] !tracking-[0.25em]">With warm welcome</p>
              <ul className="mt-1 space-y-0.5">{n.swagatkarta.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div>
              <p className="hi text-base text-sindoor-700">दर्शनाभिलाषी</p>
              <p className="eyebrow !text-[9px] !tracking-[0.25em]">Eagerly awaiting you</p>
              <p className="mt-1">{n.darshanabhilashi.join(", ")}</p>
            </div>
          </div>
          <p className="scroll-line mt-6 text-[11px] italic text-sindoor-900/55">{n.elders}</p>
          <p className="scroll-line hi mt-4 text-sm text-sindoor-600">{invitation.blessing}</p>
        </div>
        <div className="scroll-rod-bottom -mt-2">
          <Rod />
        </div>
      </div>
    </section>
  );
}
