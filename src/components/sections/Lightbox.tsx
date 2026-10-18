"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Photo as PhotoT } from "@/config/wedding";
import { Photo } from "@/components/ui/Photo";
import { ChevronIcon, CloseIcon } from "@/components/ui/Icons";
import { useExperience } from "@/components/providers/ExperienceProvider";

/** Full-screen photo viewer: ← → / Esc, swipe left/right/down, neighbours preloaded. */
export default function Lightbox({ photos, index, onClose, onIndex }: { photos: PhotoT[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const { lockScroll, unlockScroll } = useExperience();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const n = photos.length;
  const prev = useCallback(() => onIndex((index - 1 + n) % n), [index, n, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % n), [index, n, onIndex]);

  useEffect(() => {
    lockScroll();
    const opener = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    return () => {
      unlockScroll();
      opener?.focus();
    };
  }, [lockScroll, unlockScroll]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  const p = photos[index];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${n}: ${p.alt}`}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-sindoor-900/95 backdrop-blur-xl"
      onClick={onClose}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        touch.current = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
        else if (dy > 90) onClose();
      }}
    >
      <figure className="relative h-[76svh] w-[92vw] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <Photo key={p.src} src={p.src} alt={p.alt} fill sizes="92vw" className="animate-fade-up object-contain" priority />
        <figcaption className="absolute inset-x-0 -bottom-10 text-center font-serif text-sm italic text-paper/70">{p.alt}</figcaption>
      </figure>
      <div className="hidden" aria-hidden>
        {[photos[(index + 1) % n], photos[(index - 1 + n) % n]].map((x) => (
          <Photo key={x.src} src={x.src} alt="" width={x.width} height={x.height} sizes="92vw" priority />
        ))}
      </div>
      <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-paper/10 text-paper">
        <CloseIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Previous photo"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 text-paper sm:flex"
      >
        <ChevronIcon className="h-5 w-5 rotate-180" />
      </button>
      <button
        type="button"
        aria-label="Next photo"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 text-paper sm:flex"
      >
        <ChevronIcon className="h-5 w-5" />
      </button>
      <p className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 text-[11px] tracking-[0.3em] text-paper/60">
        {index + 1} / {n}
      </p>
    </div>
  );
}
