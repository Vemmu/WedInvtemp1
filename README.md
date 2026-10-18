# Wedding Invitation: Template 4 "Shubh Vivah"

A Hindu wedding invitation with **3D bride and groom figures in traditional attire** and the **Saat Phere around the sacred fire**. It's bilingual (English and हिन्दी) and uses real CC0 photos. The "Kesariya" palette is paper cream, sindoor red, kesar saffron, haldi yellow, peacock teal and sona gold. Fonts are Rozha One, Tiro Devanagari Hindi and Mukta, all with Devanagari support.

**Stack:** Next.js 15 (App Router) · React 19 · Tailwind CSS · Three.js + @react-three/fiber + drei · GSAP ScrollTrigger · Lenis

## The experience

| # | Section | What happens |
| --- | --- | --- |
| 1 | **Loader** | Under "॥ श्री गणेशाय नमः ॥", a rangoli mandala draws itself ring by ring in colour. It then spins away and the screen opens like an iris. |
| 2 | **Lotus** (3D) | A lotus bud floats on dark water among lily pads, drifting diyas and ripples. Tapping it unfurls three rings of petals, raises a golden flame from its heart, drops marigold torans in from above and lifts the camera into the light. |
| 3 | **Varmala** (3D) | The **groom** (sherwani, saffron safa with kalgi, stole) and the **bride** (red lehenga with zari, ghoonghat dupatta, maang tikka, nath, chooda, mehendi) stand on a rangoli stage. Behind them are a marigold curtain and a flower-ringed golden halo. They exchange garlands one after the other while petals shower down. |
| 4 | **Nimantran Patra** | The traditional invitation is a paper scroll that unrolls as you scroll. It holds the Ganesh vandana (with its meaning), the hosts, the couple, the muhurat, and the **Swagatkarta** and **Darshanabhilashi** lists. |
| 5 | **Our story** | Photos open through a circular iris inside rotating gold halos. |
| 6 | **Saat Phere** (3D, scroll-driven) | The section pins while the couple, tied by the **gathbandhan**, circle the **agni kund** seven times under a marigold mandap with kalash and diyas. The bride leads the first rounds and the groom the rest. Each round lights one of seven diyas and reveals that **Saptapadi vow** in Hindi and English. At the end they turn to bless the guests: "शुभ विवाह". |
| 7 | **Shubh Muhurat** | A rotating **rashi dial** (the 12 zodiac signs in Devanagari) turns with scroll, a seconds ring ticks, and the countdown sits in the centre. |
| 8 | **Celebrations** | Expanding photo panels for Ganesh Puja, Haldi, Mehendi, Sangeet, Baraat, Pheras and Reception, with Hindi names, dress-code colours and calendar buttons. **Add all events** saves them in one .ics file. |
| 9 | **Know the rituals** | A swipeable guide for guests: Haldi, Mehendi, Jaimala, Kanyadaan, Saat Phere, Sindoor, Joota Chupai and Vidaai. |
| 10 | **Venue** | Map, directions, "Getting here" tabs (air, train, road), stay and weather notes. |
| 11 | **Gallery** | Three columns of arched (jharokha) photos that drift at different speeds as you scroll, plus a lightbox. |
| 12 | **Families** | Kanya paksh and var paksh, joined by ॐ, plus guest notes (shagun, food, mandap etiquette, safas). |
| 13 | **RSVP** | **Yes or no per ceremony**, guests, food (including Jain and no onion-garlic), an **airport or station pickup request** with arrival details, and a blessing. Also **Reply on WhatsApp**. |
| 14 | **Footer** | A toran, "सदा सौभाग्यवती भव", monogram, hashtag, contacts and "Save all dates". |

A floating bottom dock with bilingual labels and a shehnai equaliser button is available on every screen.

## Quick start

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## Customising: edit one file

Everything lives in **[`src/config/wedding.ts`](src/config/wedding.ts)**: names (with `hi` Devanagari versions), dates and muhurat, events, the nimantran text, shloka, vows, rituals guide, venue and travel, gallery, families, guest notes, RSVP options and contacts.

- **Dates:** use ISO strings with `+05:30`. `weddingDate` is the phera muhurat that the countdown targets.
- **Photos:** the included photos are **CC0 (public domain)** from Rawpixel, Wikimedia Commons and StockSnap (see [`public/images/CREDITS.md`](public/images/CREDITS.md)). Swap in the couple's own photos.
- **3D figures:** outfits and skin, hair, lehenga, safa and other colours are set in the `MAT` object at the top of [`src/components/three/figures.tsx`](src/components/three/figures.tsx).
- **Music:** add a shehnai track at `public/audio/bg-music.mp3`. It never autoplays; it starts when the guest taps the lotus.

## RSVP submissions

The form POSTs JSON to `wedding.rsvp.endpoint`, which defaults to the built-in `/api/rsvp`. Set `RSVP_WEBHOOK_URL` (see `.env.example`) to forward each RSVP, for example to a Google Sheet through Apps Script. The per-event answers go in `events`, and food and pickup details go in `message`.

## WhatsApp link preview

`src/app/opengraph-image.tsx` renders a 1200×630 preview card with diyas on the Ganga. Set `NEXT_PUBLIC_SITE_URL` to your domain before sharing. The preview uses English and transliteration because the image renderer can't shape Devanagari; the website itself renders Hindi correctly.

## Performance and accessibility

- **Quality tiers:** `high`, `low` and `2d`, chosen once at load from the device. Force one with `?quality=2d|low|high`.
- **2D fallbacks:** each 3D scene has one (CSS lotus, arched bride photo, the seven vows as cards).
- **Runtime safety nets:**
  - **Frame rate:** if it drops, quality lowers from high to low without changing the layout.
  - **WebGL failure:** if a scene fails, a photo takes its place.
  - **Stuck intro:** if the opening animation never finishes, the invitation opens by itself after 7 seconds.
- **No downloads for 3D:** everything is procedural, there are no model files, and canvases mount lazily and pause off-screen.
- **`prefers-reduced-motion`:** native scrolling, no pinning, and the pheras show their completed state.

## Structure

```
src/
├── config/wedding.ts            ★ all couple details (English + हिन्दी)
├── app/                         layout (fonts + OG meta), page, globals.css, OG image, favicon, api/rsvp
├── components/
│   ├── providers/               ExperienceProvider (stage, quality, Lenis, music), ScrollReveal
│   ├── intro/                   Loader (rangoli), LotusGate, LotusFallback
│   ├── three/                   SceneCanvas, figures (bride, groom, varmala), props (diya, kalash,
│   │                            mandap, agni kund, rangoli, petals), LotusScene, VarmalaScene, PheraScene
│   ├── sections/                Hero, Nimantran, Story, Pheras, Muhurat, Events, Rituals, Venue,
│   │                            Gallery, Lightbox, Families, RSVP, Footer
│   └── ui/                      Dock, Toran, SectionTitle, Photo, Icons
└── lib/                         date, calendar (incl. all-events .ics), tilt, quality, cn
public/images/                   CC0 sample photos + CREDITS.md
```
