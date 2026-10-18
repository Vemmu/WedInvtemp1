"use client";

import { useState } from "react";
import { wedding } from "@/config/wedding";
import { formatDayMonth, formatLongDate } from "@/lib/date";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

type Arrival = { mode: "" | "Flight" | "Train" | "Car"; date: string; ref: string };
type Form = { name: string; guests: number; events: Record<string, boolean>; diet: string; pickup: boolean; arrival: Arrival; message: string };
type Status = "idle" | "sending" | "sent" | "error";

const initial: Form = { name: "", guests: 1, events: {}, diet: "", pickup: false, arrival: { mode: "", date: "", ref: "" }, message: "" };

/**
 * RSVP: choose yes/no for each ceremony individually, guests, food preference,
 * and request an airport / station pickup with arrival details. Plus WhatsApp.
 */
export default function RSVP() {
  const [form, setForm] = useState<Form>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const attending = wedding.events.filter((e) => form.events[e.id]);
  const decided = wedding.events.filter((e) => form.events[e.id] !== undefined).length;
  const anyYes = attending.length > 0;

  const summary = () =>
    [
      `Namaste! RSVP for ${wedding.bride.firstName} & ${wedding.groom.firstName}'s wedding 🪔`,
      `Name: ${form.name || "-"}`,
      anyYes ? `Attending: ${attending.map((e) => e.name).join(", ")} · Guests: ${form.guests}` : "Sadly can't attend; sending blessings 🙏",
      form.diet && `Food: ${form.diet}`,
      form.pickup && `Pickup: ${form.arrival.mode || "-"} on ${form.arrival.date || "-"} (${form.arrival.ref || "no ref"})`,
      form.message && `Blessing: ${form.message}`,
    ]
      .filter(Boolean)
      .join("\n");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please tell us your name.");
    if (decided === 0) return setError("Please choose yes or no for at least one ceremony.");
    setError("");
    setStatus("sending");
    try {
      const res = await fetch(wedding.rsvp.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          attending: anyYes ? "yes" : "no",
          guests: anyYes ? form.guests : 0,
          events: attending.map((x) => x.name),
          message: [form.message, form.diet && `Food: ${form.diet}`, form.pickup && `Pickup: ${form.arrival.mode} ${form.arrival.date} ${form.arrival.ref}`].filter(Boolean).join(" | "),
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again or reply on WhatsApp.");
    }
  };

  return (
    <section id="rsvp" className="band-peacock">
      <div className="section max-w-3xl">
        <SectionTitle light hi="कृपया पधारें" eyebrow="Kindly respond" title="Will you bless us in person?" subtitle={`Please reply by ${formatLongDate(wedding.rsvp.deadline)}.`} />

        {status === "sent" ? (
          <div className="animate-fade-up rounded-[2rem] border border-sona-400/40 bg-paper/5 p-10 text-center">
            <p className="hi text-5xl text-sona-300">धन्यवाद</p>
            <p className="mt-3 font-display text-2xl">Thank you, {form.name.split(" ")[0]}!</p>
            <p className="mt-2 text-paper/75">{anyYes ? "We can't wait to celebrate with you in Kashi." : "You'll be missed. Thank you for your blessings."}</p>
            <button type="button" className="btn-line-light mt-8" onClick={() => (setForm(initial), setStatus("idle"))}>
              Send another response
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="rounded-[2rem] bg-paper p-6 text-sindoor-900 shadow-deep sm:p-10" data-reveal>
            <label htmlFor="r-name" className="eyebrow mb-2 block">
              Your name
            </label>
            <input id="r-name" className="field" autoComplete="name" placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />

            <fieldset className="mt-8">
              <legend className="eyebrow mb-3 block">Which ceremonies will you attend?</legend>
              <ul className="divide-y divide-sindoor-800/10 rounded-2xl border border-sindoor-800/15">
                {wedding.events.map((ev) => {
                  const v = form.events[ev.id];
                  const { day, month } = formatDayMonth(ev.start);
                  return (
                    <li key={ev.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: ev.accent }} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg leading-tight">{ev.name}</span>
                        <span className="text-xs text-sindoor-900/60">
                          {day} {month} · <span className="hi">{ev.hi}</span>
                        </span>
                      </span>
                      <span className="flex shrink-0 overflow-hidden rounded-full border border-sindoor-800/20" role="radiogroup" aria-label={`Attending ${ev.name}?`}>
                        {([
                          [true, "Yes"],
                          [false, "No"],
                        ] as const).map(([val, label]) => (
                          <button
                            key={label}
                            type="button"
                            role="radio"
                            aria-checked={v === val}
                            onClick={() => set("events", { ...form.events, [ev.id]: val })}
                            className={cn("px-3.5 py-1.5 text-xs font-semibold transition-colors", v === val ? (val ? "bg-peacock-700 text-paper" : "bg-sindoor-600 text-paper") : "text-sindoor-800 hover:bg-paper-200")}
                          >
                            {label}
                          </button>
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 flex gap-3 text-xs">
                <button type="button" className="font-semibold text-peacock-700 underline-offset-2 hover:underline" onClick={() => set("events", Object.fromEntries(wedding.events.map((e) => [e.id, true])))}>
                  Yes to all
                </button>
                <button type="button" className="font-semibold text-sindoor-600 underline-offset-2 hover:underline" onClick={() => set("events", Object.fromEntries(wedding.events.map((e) => [e.id, false])))}>
                  Can&apos;t make it
                </button>
              </div>
            </fieldset>

            {anyYes && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="eyebrow mb-3">Guests (including you)</p>
                  <div className="flex items-center gap-3">
                    <button type="button" className="btn-line h-11 w-11 !p-0 text-lg" onClick={() => set("guests", Math.max(1, form.guests - 1))} aria-label="Fewer guests">
                      −
                    </button>
                    <span className="w-10 text-center font-display text-3xl" aria-live="polite">
                      {form.guests}
                    </span>
                    <button type="button" className="btn-line h-11 w-11 !p-0 text-lg" onClick={() => set("guests", Math.min(wedding.rsvp.maxGuests, form.guests + 1))} aria-label="More guests">
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="r-diet" className="eyebrow mb-2 block">
                    Food preference
                  </label>
                  <select id="r-diet" className="field" value={form.diet} onChange={(e) => set("diet", e.target.value)}>
                    <option value="">No preference</option>
                    {wedding.rsvp.dietOptions.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" className="h-5 w-5 accent-[#B3001B]" checked={form.pickup} onChange={(e) => set("pickup", e.target.checked)} />
                    <span className="font-display text-lg">I&apos;d like a pickup on arrival in Varanasi</span>
                  </label>
                  {form.pickup && (
                    <div className="mt-4 grid animate-fade-up gap-3 sm:grid-cols-3">
                      <select aria-label="Arriving by" className="field" value={form.arrival.mode} onChange={(e) => set("arrival", { ...form.arrival, mode: e.target.value as Arrival["mode"] })}>
                        <option value="">Arriving by…</option>
                        <option>Flight</option>
                        <option>Train</option>
                        <option>Car</option>
                      </select>
                      <input aria-label="Arrival date" type="date" className="field" value={form.arrival.date} onChange={(e) => set("arrival", { ...form.arrival, date: e.target.value })} />
                      <input aria-label="Flight or train number" className="field" placeholder="Flight / train no." value={form.arrival.ref} onChange={(e) => set("arrival", { ...form.arrival, ref: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>
            )}

            <label htmlFor="r-msg" className="eyebrow mb-2 mt-8 block">
              Your aashirwad (blessing) for the couple
            </label>
            <textarea id="r-msg" rows={4} className="field resize-none" placeholder="Your wishes and blessings…" value={form.message} onChange={(e) => set("message", e.target.value)} />

            {error && (
              <p role="alert" className="mt-4 text-sm text-sindoor-600">
                {error}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="btn-sindoor flex-1" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send RSVP"}
              </button>
              <a
                href={`https://wa.me/${wedding.rsvp.whatsappNumber}?text=${encodeURIComponent(summary())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-line flex-1 !border-[#25D366] !py-3.5 !text-[#128C4B] hover:!bg-[#25D366] hover:!text-white"
              >
                <WhatsAppIcon className="h-4 w-4" /> Reply on WhatsApp
              </a>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
