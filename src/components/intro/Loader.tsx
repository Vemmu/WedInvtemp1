"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { wedding } from "@/config/wedding";
import { useExperience } from "@/components/providers/ExperienceProvider";

const COLORS = ["#B3001B", "#F28C0F", "#1A9C95", "#E94C89", "#F7C71C"];

/**
 * Loader: a rangoli mandala draws itself ring by ring and fills with colour as
 * assets load, under "|| श्री गणेशाय नमः ||". When ready, it spins and the
 * screen opens outward like an iris onto the lotus.
 */
export default function Loader() {
  const { stage, setStage } = useExperience();
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const ready = useRef(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const tasks: Promise<unknown>[] = [
      document.fonts.ready,
      document.fonts.load(`400 40px ${css.getPropertyValue("--font-display")}`).catch(() => null),
      document.fonts.load(`400 40px ${css.getPropertyValue("--font-serif")}`, "श्री").catch(() => null),
      new Promise((r) => (document.readyState === "complete" ? r(null) : window.addEventListener("load", r, { once: true }))),
      new Promise((r) => setTimeout(r, 1800)),
      import("@/components/three/LotusScene").catch(() => null),
    ];
    let cancelled = false;
    Promise.all(tasks).then(() => {
      if (!cancelled) ready.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let p = 0;
    const tick = () => {
      const target = ready.current ? 100 : 88;
      p += (target - p) * (ready.current ? 0.1 : 0.025);
      if (target - p < 0.4) p = target;
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (progress < 100 || stage !== "loading" || !root.current) return;
    const q = gsap.utils.selector(root.current);
    gsap
      .timeline({ delay: 0.2, onComplete: () => setHidden(true) })
      .to(q(".ld-mandala"), { rotate: 180, scale: 1.4, opacity: 0, duration: 1.1, ease: "power2.in" })
      .to(q(".ld-text"), { opacity: 0, duration: 0.4 }, "<")
      .add(() => setStage("gate"), "-=0.3")
      // iris: a transparent hole opens from the centre outward, revealing the lotus
      .fromTo(root.current, { "--hole": "0%" }, { "--hole": "150%", duration: 1.2, ease: "expo.inOut" });
  }, [progress, stage, setStage]);

  if (hidden) return null;
  const pct = Math.round(progress);
  const rings = [
    { r: 18, n: 6, size: 9 },
    { r: 34, n: 10, size: 10 },
    { r: 52, n: 14, size: 11 },
    { r: 70, n: 18, size: 11 },
  ];

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-paper px-6"
      style={{
        ["--hole" as string]: "0%",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent var(--hole), #000 calc(var(--hole) + 1%))",
        maskImage: "radial-gradient(circle at 50% 50%, transparent var(--hole), #000 calc(var(--hole) + 1%))",
      }}
      role="progressbar"
      aria-label="Loading invitation"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <p className="ld-text hi mb-6 text-lg text-sindoor-700">{wedding.invitation.blessing}</p>
      <svg viewBox="-90 -90 180 180" className="ld-mandala h-56 w-56" aria-hidden>
        {rings.map((ring, ri) => {
          // each ring appears once progress passes its threshold
          const shown = Math.max(0, Math.min(1, (progress - ri * 22) / 22));
          return (
            <g key={ri} style={{ opacity: shown, transform: `scale(${0.6 + shown * 0.4}) rotate(${(1 - shown) * 40}deg)`, transformOrigin: "0 0", transition: "transform .4s" }}>
              {Array.from({ length: ring.n }).map((_, i) => {
                const a = (i / ring.n) * 360;
                return (
                  <ellipse
                    key={i}
                    cx="0"
                    cy={-ring.r}
                    rx={ring.size * 0.42}
                    ry={ring.size}
                    transform={`rotate(${a})`}
                    fill={COLORS[(ri + i) % COLORS.length]}
                    fillOpacity="0.85"
                    stroke="#D4AF37"
                    strokeWidth="0.8"
                  />
                );
              })}
              <circle r={ring.r + ring.size + 2} fill="none" stroke="#D4AF37" strokeWidth="0.6" strokeDasharray="2 3" />
            </g>
          );
        })}
        <circle r="8" fill="#F7C71C" stroke="#B3001B" strokeWidth="1.5" />
        <circle r="3" fill="#B3001B" />
      </svg>
      <p className="ld-text mt-6 font-display text-5xl tabular-nums text-sindoor-700">{pct}</p>
      <p className="ld-text hi mt-2 text-sm text-kesar-600">
        {wedding.invitation.titleHi} · {wedding.bride.hi} &amp; {wedding.groom.hi}
      </p>
    </div>
  );
}
