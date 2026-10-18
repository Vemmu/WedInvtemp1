import { cn } from "@/lib/cn";

/** Little paisley / kalash motif divider */
export function Motif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M4 12 H58 M102 12 H156" />
      <path d="M80 3 C 88 3 92 10 88 15 C 85 19 78 19 76 14 C 74 9 79 7 82 10" />
      <circle cx="66" cy="12" r="2.4" fill="currentColor" />
      <circle cx="94" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}

/** Section heading: Hindi line, English eyebrow, Rozha display title, motif. */
export function SectionTitle({ hi, eyebrow, title, subtitle, light, className }: { hi?: string; eyebrow: string; title: string; subtitle?: string; light?: boolean; className?: string }) {
  return (
    <header className={cn("mb-14 text-center md:mb-20", className)}>
      {hi && (
        <p className={cn("hi text-xl", light ? "text-sona-300" : "text-sindoor-600")} data-reveal>
          {hi}
        </p>
      )}
      <p className={cn("eyebrow mt-2", light && "!text-kesar-300")} data-reveal>
        {eyebrow}
      </p>
      <h2 className={cn("mt-3 font-display text-[2.6rem] leading-[1.05] sm:text-6xl", light ? "text-paper" : "text-sindoor-800")} data-reveal>
        {title}
      </h2>
      <Motif className={cn("mx-auto mt-5 w-40", light ? "text-sona-400" : "text-kesar-500")} />
      {subtitle && (
        <p className={cn("mx-auto mt-4 max-w-xl text-base leading-relaxed", light ? "text-paper/75" : "text-sindoor-900/70")} data-reveal>
          {subtitle}
        </p>
      )}
    </header>
  );
}
