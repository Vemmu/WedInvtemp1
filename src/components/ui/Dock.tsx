"use client";

import { useEffect, useState } from "react";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "#home", label: "Home", hi: "आरंभ", icon: "M12 3 3 10v11h6v-6h6v6h6V10z" },
  { href: "#nimantran", label: "Invite", hi: "निमंत्रण", icon: "M4 5h16v14H4z M4 5l8 7 8-7" },
  { href: "#pheras", label: "Pheras", hi: "फेरे", icon: "M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z" },
  { href: "#events", label: "Events", hi: "कार्यक्रम", icon: "M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5" },
  { href: "#rsvp", label: "RSVP", hi: "उत्तर", icon: "M5 12l4 4L19 6" },
] as const;

/**
 * Floating bottom dock (app-style), shown after the lotus opens.
 * Highlights the section in view and includes the music toggle.
 */
export default function Dock() {
  const { stage, scrollTo, music } = useExperience();
  const [active, setActive] = useState("#home");

  useEffect(() => {
    if (stage !== "open") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    ITEMS.forEach((it) => {
      const el = document.querySelector(it.href);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [stage]);

  if (stage !== "open") return null;

  return (
    <nav
      aria-label="Sections"
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-sona-400/50 bg-sindoor-900/85 p-1.5 text-paper shadow-deep backdrop-blur-md"
    >
      {ITEMS.map((it) => (
        <button
          key={it.href}
          type="button"
          onClick={() => scrollTo(it.href)}
          aria-current={active === it.href ? "true" : undefined}
          className={cn(
            "flex flex-col items-center rounded-full px-3 py-1.5 transition-colors sm:px-4",
            active === it.href ? "bg-kesar-500 text-sindoor-900" : "text-paper/75 hover:text-paper"
          )}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={it.icon} />
          </svg>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]">{it.label}</span>
          <span className="hi hidden text-[10px] leading-none sm:block">{it.hi}</span>
        </button>
      ))}
      {music.available && (
        <button type="button" onClick={music.toggle} className="ml-1 flex h-11 w-11 items-center justify-center rounded-full bg-paper/10" aria-label={music.playing ? "Mute shehnai" : "Play shehnai"} aria-pressed={music.playing}>
          <span className="flex h-4 items-end gap-[2px]" aria-hidden>
            {[0, 0.2, 0.4].map((d, i) => (
              <span key={i} className={cn("w-[3px] origin-bottom rounded-full bg-kesar-300", music.playing ? "h-full animate-eq" : "h-1")} style={{ animationDelay: `${d}s` }} />
            ))}
          </span>
        </button>
      )}
    </nav>
  );
}
