"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { wedding } from "@/config/wedding";
import { formatLongDate, formatTime } from "@/lib/date";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { SectionTitle } from "@/components/ui/SectionTitle";

type Parts = { days: number; hours: number; minutes: number; seconds: number };
const diff = (target: number): Parts | null => {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  return { days: Math.floor(ms / 86_400_000), hours: Math.floor(ms / 3_600_000) % 24, minutes: Math.floor(ms / 60_000) % 60, seconds: Math.floor(ms / 1000) % 60 };
};

/** The twelve rashis (zodiac signs) in Devanagari, around the dial. */
const RASHI = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];

/**
 * Shubh Muhurat: a rotating rashi dial (like a kundli wheel). The outer ring
 * turns with scroll, the inner ring ticks with the seconds, and the countdown
 * to the pheras sits in the centre.
 */
export default function Muhurat() {
  const { stage, reducedMotion } = useExperience();
  const root = useRef<HTMLElement>(null);
  const target = new Date(wedding.weddingDate).getTime();
  const [parts, setParts] = useState<Parts | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setParts(diff(target));
    const id = setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  useGSAP(
    () => {
      if (stage !== "open" || reducedMotion) return;
      gsap.to(".dial-outer", { rotate: 120, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root, dependencies: [stage, reducedMotion] }
  );

  const married = mounted && !parts;
  const f = (n?: number) => (n == null ? "--" : String(n).padStart(2, "0"));
  const secAngle = (parts?.seconds ?? 0) * 6;

  return (
    <section ref={root} id="muhurat" className="band-peacock overflow-hidden">
      <div className="section">
        <SectionTitle light hi="शुभ मुहूर्त" eyebrow="The auspicious moment" title={married ? "Shubh vivah sampann" : "Counting to the muhurat"} subtitle={`${formatLongDate(wedding.weddingDate)} · ${formatTime(wedding.weddingDate)} · ${wedding.muhuratNote}`} />

        <div className="relative mx-auto aspect-square w-full max-w-[min(88vw,520px)]" data-reveal>
          {/* outer rashi ring (turns with scroll) */}
          <svg viewBox="-100 -100 200 200" className="dial-outer absolute inset-0 h-full w-full" aria-hidden>
            <circle r="97" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
            <circle r="80" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            {RASHI.map((r, i) => {
              const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
              return (
                <g key={r}>
                  <line x1={Math.cos(a + Math.PI / 12) * 80} y1={Math.sin(a + Math.PI / 12) * 80} x2={Math.cos(a + Math.PI / 12) * 97} y2={Math.sin(a + Math.PI / 12) * 97} stroke="#D4AF37" strokeWidth="0.5" />
                  <text x={Math.cos(a) * 88.5} y={Math.sin(a) * 88.5} fill="#F1D98A" fontSize="6.5" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "var(--font-serif)" }} transform={`rotate(${(i / 12) * 360} ${Math.cos(a) * 88.5} ${Math.sin(a) * 88.5})`}>
                    {r}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* inner ring: 60 ticks, the current second glows */}
          <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
              const on = i === (parts?.seconds ?? -1);
              return <line key={i} x1={Math.cos(a) * 70} y1={Math.sin(a) * 70} x2={Math.cos(a) * (i % 5 ? 74 : 77)} y2={Math.sin(a) * (i % 5 ? 74 : 77)} stroke={on ? "#FFAA33" : "#1A9C95"} strokeWidth={on ? 2.2 : 0.8} />;
            })}
            <g style={{ transform: `rotate(${secAngle}deg)`, transition: "transform .4s cubic-bezier(.4,2,.6,1)" }}>
              <circle cx="0" cy="-66" r="2.6" fill="#FFAA33" />
            </g>
            <circle r="62" fill="rgba(6,52,58,0.85)" stroke="#D4AF37" strokeWidth="0.6" />
          </svg>
          {/* centre: countdown */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center" role="timer" aria-live="off">
            {married ? (
              <p className="hi text-4xl text-sona-300">शुभ विवाह</p>
            ) : (
              <>
                <p className="font-display text-[clamp(3rem,15vw,6rem)] leading-none text-sona-gradient">{parts ? parts.days : "--"}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-kesar-300">days · दिन</p>
                <p className="mt-3 font-display text-2xl tabular-nums sm:text-3xl">
                  {f(parts?.hours)}:{f(parts?.minutes)}:{f(parts?.seconds)}
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-paper/60">hrs · min · sec</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
