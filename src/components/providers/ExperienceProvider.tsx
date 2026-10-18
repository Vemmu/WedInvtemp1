"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { wedding } from "@/config/wedding";
import { detectQuality, type Quality } from "@/lib/quality";

gsap.registerPlugin(ScrollTrigger);

/** loading → loader is showing; gate → envelope is waiting to be opened; open → site is scrollable */
export type Stage = "loading" | "gate" | "open";

type ExperienceContextValue = {
  stage: Stage;
  setStage: (s: Stage) => void;
  quality: Quality;
  /** Called by the PerformanceMonitor when FPS keeps dropping */
  downgradeQuality: () => void;
  reducedMotion: boolean;
  /** Smooth-scroll helpers (no-ops when Lenis is disabled for reduced motion) */
  scrollTo: (target: string | HTMLElement | number) => void;
  lockScroll: () => void;
  unlockScroll: () => void;
  music: { available: boolean; playing: boolean; toggle: () => void; play: () => void };
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside <ExperienceProvider>");
  return ctx;
}

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<Stage>("loading");
  // Start at "low" on the server/first render; upgraded/downgraded after mount.
  const [quality, setQuality] = useState<Quality>("low");
  const [reducedMotion, setReducedMotion] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  /* ------------------------------ capability ------------------------------ */
  useEffect(() => {
    setQuality(detectQuality());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Runtime FPS safety net: high → low only. Switching to the 2D layouts mid-visit would
  // swap pinned 3D sections (e.g. the aisle) for shorter ones and jump the page under the
  // guest's thumb, so "2d" is only ever chosen up front by detectQuality().
  const downgradeQuality = useCallback(() => {
    setQuality((q) => (q === "high" ? "low" : q));
  }, []);

  /* ----------------------------- smooth scroll ---------------------------- */
  useEffect(() => {
    if (reducedMotion) return; // native scrolling for reduced-motion users

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker so ScrollTrigger and Lenis share one RAF loop.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // The page is locked while the loader / envelope are on screen.
  useEffect(() => {
    const locked = stage !== "open";
    document.documentElement.classList.toggle("scroll-locked", locked);
    if (locked) lenisRef.current?.stop();
    else {
      lenisRef.current?.start();
      // Layout may have shifted while hidden — recalculate trigger positions.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }, [stage]);

  const scrollTo = useCallback((target: string | HTMLElement | number) => {
    if (lenisRef.current) lenisRef.current.scrollTo(target, { duration: 1.6 });
    else if (typeof target === "number") window.scrollTo({ top: target });
    else {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView();
    }
  }, []);
  const lockScroll = useCallback(() => {
    lenisRef.current?.stop();
    document.documentElement.classList.add("scroll-locked");
  }, []);
  const unlockScroll = useCallback(() => {
    lenisRef.current?.start();
    document.documentElement.classList.remove("scroll-locked");
  }, []);

  /* --------------------------------- music -------------------------------- */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicAvailable, setMusicAvailable] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.src = wedding.music.src;
    audio.loop = true;
    audio.preload = "none"; // don't spend guests' mobile data until they want music
    audio.volume = wedding.music.volume;
    const onError = () => setMusicAvailable(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("error", onError);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audioRef.current = audio;

    // Check that the file exists without downloading it.
    fetch(wedding.music.src, { method: "HEAD" })
      .then((r) => !r.ok && setMusicAvailable(false))
      .catch(() => setMusicAvailable(false));

    // Pause when the guest switches apps (e.g. back to WhatsApp).
    const onVisibility = () => document.hidden && audio.pause();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      audio.pause();
      audio.removeEventListener("error", onError);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {
      /* autoplay blocked / missing file — the toggle stays available */
    });
  }, []);
  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) play();
    else a.pause();
  }, [play]);

  const value = useMemo<ExperienceContextValue>(
    () => ({
      stage,
      setStage,
      quality,
      downgradeQuality,
      reducedMotion,
      scrollTo,
      lockScroll,
      unlockScroll,
      music: { available: musicAvailable, playing, toggle, play },
    }),
    [stage, quality, downgradeQuality, reducedMotion, scrollTo, lockScroll, unlockScroll, musicAvailable, playing, toggle, play]
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}
