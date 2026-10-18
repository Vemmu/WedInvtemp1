"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useExperience } from "./ExperienceProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Generic scroll reveal: any element with `data-reveal` fades/slides in when it
 * enters the viewport. Children of `data-reveal-stagger` animate one after another.
 * Skipped entirely for prefers-reduced-motion.
 */
export default function ScrollReveal() {
  const { stage, reducedMotion } = useExperience();

  useGSAP(
    () => {
      if (stage !== "open" || reducedMotion) return;

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]").forEach((group) => {
        gsap.from(group.children, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: group, start: "top 85%", once: true },
        });
      });
    },
    { dependencies: [stage, reducedMotion] }
  );

  return null;
}
