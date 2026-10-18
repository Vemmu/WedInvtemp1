import { wedding } from "@/config/wedding";
import { SectionTitle, Motif } from "@/components/ui/SectionTitle";

/** Kanya paksh & var paksh, joined by a knot motif, followed by guest notes. Server component. */
export default function Families() {
  const { families, bride, groom, guestNotes } = wedding;
  const sides = [
    { f: families.bride, person: bride.fullName, hi: bride.hi },
    { f: families.groom, person: groom.fullName, hi: groom.hi },
  ];
  return (
    <section id="families" className="section">
      <SectionTitle hi="दो परिवार, एक बंधन" eyebrow="Two families, one bond" title="Our families" />
      <div className="relative grid gap-6 md:grid-cols-2 md:gap-16" data-reveal-stagger>
        {sides.map(({ f, person, hi }) => (
          <article key={f.title} className="card relative overflow-hidden p-8 text-center">
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-kesar-500 via-sindoor-600 to-kesar-500" aria-hidden />
            <p className="hi text-lg text-sindoor-600">{f.hi}</p>
            <p className="eyebrow mt-1">{f.title}</p>
            <p className="hi mt-5 text-4xl text-sindoor-700">{hi}</p>
            <p className="font-display text-2xl text-sindoor-800">{person}</p>
            <Motif className="mx-auto my-5 w-28 text-kesar-500" />
            <p className="text-sm text-sindoor-900/60">Beloved child of</p>
            <p className="mt-1 font-display text-xl text-sindoor-800">{f.parents}</p>
            <p className="text-sm text-sindoor-900/60">{f.home}</p>
            <p className="mt-4 text-sm text-sindoor-900/75">{f.siblings}</p>
          </article>
        ))}
        {/* the knot between the families */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-paper bg-sindoor-600 font-display text-2xl text-paper shadow-warm md:flex" aria-hidden>
          ॐ
        </span>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger>
        {guestNotes.map((n) => (
          <div key={n.title} className="rounded-[1.5rem] border border-kesar-400/40 bg-kesar-300/10 p-6">
            <p className="font-display text-xl text-sindoor-800">{n.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-sindoor-900/75">{n.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
