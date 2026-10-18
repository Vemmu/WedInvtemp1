"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { gsap } from "gsap";
import { wedding } from "@/config/wedding";
import { enableTilt } from "@/lib/tilt";
import { useExperience } from "@/components/providers/ExperienceProvider";
import LotusFallback from "./LotusFallback";

const LotusScene = dynamic(() => import("@/components/three/LotusScene"), { ssr: false });

/**
 * The lotus gate. Tap → petals unfurl, a flame rises, torans drop, the camera
 * rises into the light → a saffron flash fades into the site.
 * The tap is also the gesture that starts music and requests tilt access.
 */
export default function LotusGate() {
  const { stage, setStage, quality, reducedMotion, music } = useExperience();
  const [opening, setOpening] = useState(false);
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const finished = useRef(false);

  const onOpened = useCallback(() => {
    if (finished.current) return; // runs once, whether called by the scene or the safety net
    finished.current = true;
    const d = reducedMotion ? 0.01 : 1;
    gsap
      .timeline({ onComplete: () => setDone(true) })
      .to(flash.current, { opacity: 1, duration: d * 0.35, ease: "power1.in" })
      .add(() => setStage("open"))
      .to(root.current, { opacity: 0, duration: d * 1.1, ease: "power2.out" }, "+=0.1");
  }, [reducedMotion, setStage]);

  const open = () => {
    if (opening) return;
    setOpening(true);
    enableTilt();
    if (wedding.music.playOnOpen && music.available) music.play();
    // Safety net: if the 3D animation never reports back (GPU lost the WebGL context), open anyway.
    window.setTimeout(() => onOpened(), 7000);
  };

  if (done) return null;
  const fallback = <LotusFallback opening={opening} onOpened={onOpened} reducedMotion={reducedMotion} />;

  return (
    <div ref={root} className="fixed inset-0 z-50 overflow-hidden bg-[#08222A] text-paper">
      {stage !== "loading" && (quality === "2d" ? fallback : <LotusScene opening={opening} onOpened={onOpened} high={quality === "high"} fallback={fallback} />)}

      <div className="pointer-events-none absolute inset-x-0 top-[max(2.5rem,env(safe-area-inset-top))] text-center transition-opacity duration-500" style={{ opacity: opening ? 0 : 1 }}>
        <p className="hi text-base text-sona-300">{wedding.invitation.blessing}</p>
        <p className="hi mt-2 text-3xl text-paper">{wedding.invitation.titleHi}</p>
      </div>

      <button
        type="button"
        onClick={open}
        disabled={opening || stage !== "gate"}
        className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-24 text-center transition-all duration-500 disabled:cursor-default"
        style={{ opacity: opening ? 0 : 1, transform: opening ? "translateY(20px)" : "none" }}
        aria-label="Open the invitation"
      >
        <span className="font-display text-4xl leading-none sm:text-5xl">
          {wedding.bride.firstName} <span className="text-kesar-400">&amp;</span> {wedding.groom.firstName}
        </span>
        <span className="hi text-lg text-sona-300">
          {wedding.bride.hi} &amp; {wedding.groom.hi}
        </span>
        <span className="btn-sona mt-3">{wedding.invitation.lotusLine}</span>
      </button>

      <div ref={flash} className="pointer-events-none absolute inset-0 bg-gradient-to-b from-kesar-300 to-paper opacity-0" />
    </div>
  );
}
