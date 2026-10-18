import { NextResponse } from "next/server";

/**
 * RSVP endpoint.
 * Validates the submission, then forwards it as JSON to RSVP_WEBHOOK_URL if set
 * (e.g. a Google Apps Script web app that appends a row to a Google Sheet —
 * see README). Without a webhook the RSVP is just logged on the server.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  const attending = body.attending === "yes" || body.attending === "no" ? body.attending : null;
  if (!name || !attending) return NextResponse.json({ ok: false, error: "Name and attendance are required" }, { status: 422 });

  const rsvp = {
    name,
    attending,
    guests: Math.max(0, Math.min(20, Number(body.guests) || 0)),
    events: Array.isArray(body.events) ? body.events.map(String).slice(0, 10) : [],
    message: String(body.message ?? "").slice(0, 2000),
    submittedAt: new Date().toISOString(),
  };

  const webhook = process.env.RSVP_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rsvp) });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } catch (err) {
      console.error("[rsvp] webhook failed", err);
      return NextResponse.json({ ok: false, error: "Could not save RSVP" }, { status: 502 });
    }
  } else {
    console.log("[rsvp] (no RSVP_WEBHOOK_URL set)", rsvp);
  }

  return NextResponse.json({ ok: true });
}
