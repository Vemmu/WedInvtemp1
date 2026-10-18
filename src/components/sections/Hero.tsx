"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { wedding } from "@/config/wedding";
import { formatLongDate } from "@/lib/date";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { Photo } from "@/components/ui/Photo";
import { Toran } from "@/components/ui/Toran";

const VarmalaScene = dynamic(() => import("@/components/three/VarmalaScene"), { ssr: false });

/** 2D fallback: the bride photo in a jharokha (arched window) frame. */
function HeroFallback() {
  const p = wedding.events.find((e) => e.id === "pheras")!.photo;
  return (
    <div className="absolute inset-x-0 bottom-[8%] flex justify-center md:inset-y-0 md:left-auto md:right-[7%] md:items-center">
      <div className="relative aspect-[3/4] w-[60vw] max-w-[360px] overflow-hidden rounded-t-full border-[6px] border-sona-400 shadow-deep">
        <Photo src={p.src} alt={p.alt} fill sizes="360px" className="object-cover" priority />
      </div>
    </div>
  );
}

export default function Hero() {
  const { stage, quality, reducedMotion, scrollTo } = useExperience();
  const root = useRef<HTMLElement>(null);
  const { bride, groom, weddingDate, city, cityHi, invitation } = wedding;

  useGSAP(
    () => {
      if (stage !== "open" || reducedMotion) return;
      gsap
        .timeline({ delay: 0.5 })
        .from(".hero-toran", { yPercent: -100, duration: 1.4, ease: "bounce.out" })
        .from(".hero-name", { opacity: 0, scale: 0.6, rotate: -6, duration: 1.1, ease: "back.out(1.8)", stagger: 0.18 }, "-=0.9")
        .from(".hero-fade", { opacity: 0, y: 18, duration: 0.8, stagger: 0.08, ease: "power2.out" }, "-=0.6");
      gsap.to(".hero-copy", { yPercent: -16, opacity: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "80% top", scrub: true } });
    },
    { scope: root, dependencies: [stage, reducedMotion] }
  );

  return (
    <section ref={root} id="home" className="band-sindoor relative flex min-h-[100svh] overflow-hidden">
      {quality === "2d" ? <HeroFallback /> : <VarmalaScene start={stage === "open"} high={quality === "high"} fallback={<HeroFallback />} />}

      <Toran className="hero-toran pointer-events-none absolute inset-x-0 top-0 z-10 w-full" strands={17} />

      <div className="hero-copy pointer-events-none relative z-10 mx-auto flex w-full max-w-6xl flex-col px-6 pt-[max(6rem,13svh)] text-center md:justify-center md:pt-36 md:text-left">
        <div className="md:max-w-[44%]">
          <p className="hero-fade hi text-lg text-sona-300">{invitation.blessing}</p>
          <p className="hero-fade eyebrow mt-3 !text-kesar-300">{invitation.title} · {invitation.titleHi}</p>
          <h1 className="mt-4 font-display leading-[0.95]">
            <span className="hero-name block text-[13vw] sm:text-7xl md:text-8xl">{bride.firstName}</span>
            <span className="hero-name block font-serif text-3xl text-kesar-300 sm:text-4xl">संग</span>
            <span className="hero-name block text-[13vw] sm:text-7xl md:text-8xl">{groom.firstName}</span>
          </h1>
          <p className="hero-fade hi mt-3 text-2xl text-sona-300">
            {bride.hi} &amp; {groom.hi}
          </p>
          <p className="hero-fade mx-auto mt-5 hidden max-w-sm text-sm leading-relaxed text-paper/75 sm:block md:mx-0">{invitation.line}</p>
          <div className="hero-fade mt-6 inline-flex flex-col items-center rounded-2xl border border-sona-400/40 bg-sindoor-900/40 px-6 py-3 backdrop-blur md:items-start">
            <span className="font-display text-xl">{formatLongDate(weddingDate)}</span>
            <span className="text-[11px] uppercase tracking-[0.3em] text-kesar-300">
              {city} · <span className="hi normal-case tracking-normal">{cityHi}</span>
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollTo("#nimantran")}
        className="hero-fade absolute bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5rem))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-paper/70"
      >
        <span className="relative h-10 w-px overflow-hidden bg-paper/25">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-line bg-kesar-300" />
        </span>
        Scroll
      </button>
    </section>
  );
}
