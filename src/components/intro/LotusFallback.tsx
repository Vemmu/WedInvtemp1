"use client";

import { useEffect } from "react";

/**
 * CSS-only lotus for low-end phones and reduced-motion users:
 * three rings of petals unfurl and a flame rises from the centre.
 */
export default function LotusFallback({ opening, onOpened, reducedMotion }: { opening: boolean; onOpened: () => void; reducedMotion: boolean }) {
  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(onOpened, reducedMotion ? 50 : 1900);
    return () => clearTimeout(t);
  }, [opening, onOpened, reducedMotion]);

  const layers = [
    { n: 9, len: 92, open: 70, color: "#F28FB2" },
    { n: 8, len: 78, open: 48, color: "#F5A3C2" },
    { n: 7, len: 62, open: 26, color: "#F9C6D8" },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_55%,#0E4A52,#06222A_70%)] pb-24">
      <div className="relative h-56 w-56">
        <div className="absolute inset-x-6 bottom-6 h-10 rounded-[50%] bg-[#2E7D4F]" />
        {layers.map((l, li) =>
          Array.from({ length: l.n }).map((_, i) => (
            <span
              key={`${li}-${i}`}
              className="absolute bottom-12 left-1/2 origin-bottom rounded-[50%_50%_50%_50%/80%_80%_20%_20%] transition-transform duration-[1400ms] ease-out"
              style={{
                width: l.len * 0.42,
                height: l.len,
                marginLeft: -(l.len * 0.21),
                background: `linear-gradient(to top, #FFF6EC, ${l.color})`,
                transform: `rotate(${((i - (l.n - 1) / 2) / l.n) * (opening ? l.open * 2.6 : 30)}deg)`,
                transitionDelay: `${li * 200}ms`,
                zIndex: li,
              }}
            />
          ))
        )}
        {/* outer span owns visibility/position; the inner one flickers (a CSS animation would override inline opacity) */}
        <span
          className="absolute bottom-24 left-1/2 z-10 transition-all duration-1000"
          style={{ opacity: opening ? 1 : 0, transform: `translateX(-50%) translateY(${opening ? -40 : 0}px)` }}
        >
          <span className="block h-10 w-5 animate-flicker rounded-[50%_50%_50%_50%/70%_70%_30%_30%] bg-gradient-to-t from-kesar-500 to-haldi-300 shadow-[0_0_40px_12px_rgba(255,190,90,0.6)]" />
        </span>
      </div>
    </div>
  );
}
