import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { wedding } from "@/config/wedding";
import { formatLongDate } from "@/lib/date";

/**
 * 1200×630 link preview generated at build time: diyas on the Ganga behind a
 * sindoor panel with the names in English and Devanagari. WhatsApp shows this.
 */
export const alt = `${wedding.bride.firstName} & ${wedding.groom.firstName}: Shubh Vivah`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Google font as TTF (no browser UA → TTF). Null when offline.
 *  Note: the OG renderer (Satori) cannot shape Devanagari (matras end up in the wrong place),
 *  so the preview uses English / transliteration only. The website itself renders Hindi correctly. */
async function loadFont(family: string, text?: string): Promise<ArrayBuffer | null> {
  try {
    const q = text ? `&text=${encodeURIComponent(text)}` : "";
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}${q}`).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype|woff)'\)/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const { bride, groom, weddingDate, city, hashtag, invitation } = wedding;
  const [display, deva, pic] = await Promise.all([
    loadFont("Rozha+One"),
    loadFont("Tiro+Devanagari+Hindi:ital@1"),
    readFile(join(process.cwd(), "public/images/ganga-diyas.jpg")).then((b) => `data:image/jpeg;base64,${b.toString("base64")}`).catch(() => null),
  ]);
  const fonts = [
    display && { name: "Rozha", data: display, style: "normal" as const, weight: 400 as const },
    deva && { name: "Tiro", data: deva, style: "italic" as const, weight: 400 as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; style: "normal" | "italic"; weight: 400 }[];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#5E0814", color: "#FFF8EE" }}>
        {pic && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pic} width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, objectFit: "cover", opacity: 0.9 }} alt="" />
        )}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, rgba(61,4,12,0) 0%, rgba(61,4,12,0.35) 30%, rgba(61,4,12,0.94) 58%)", display: "flex" }} />
        <div style={{ marginLeft: "auto", width: 640, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: 40 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, color: "#F1D98A", fontFamily: deva ? "Tiro" : "serif", fontStyle: "italic", display: "flex" }}>Shri Ganeshaya Namah</div>
          <div style={{ fontSize: 26, letterSpacing: 8, textTransform: "uppercase", color: "#FFC46B", marginTop: 14, display: "flex" }}>{invitation.title}</div>
          <div style={{ fontSize: 104, fontFamily: display ? "Rozha" : "serif", marginTop: 6, lineHeight: 1, display: "flex" }}>{bride.firstName}</div>
          <div style={{ fontSize: 44, color: "#D4AF37", fontFamily: display ? "Rozha" : "serif", display: "flex" }}>&</div>
          <div style={{ fontSize: 104, fontFamily: display ? "Rozha" : "serif", lineHeight: 1, display: "flex" }}>{groom.firstName}</div>
          <div style={{ width: 280, height: 2, background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", marginTop: 18, display: "flex" }} />
          <div style={{ fontSize: 28, marginTop: 16, display: "flex" }}>{formatLongDate(weddingDate)}</div>
          <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "#FFC46B", marginTop: 6, display: "flex" }}>
            {city} · {hashtag}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
