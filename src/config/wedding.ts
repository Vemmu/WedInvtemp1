/**
 * ============================================================================
 *  WEDDING CONFIG (Template 4: "Shubh Vivah", a Hindu wedding).
 *  Edit only this file.
 * ============================================================================
 *
 *  • Dates are ISO-8601 strings WITH a timezone offset (+05:30 for IST).
 *  • `hi` fields are the Hindi / Devanagari versions shown beside English.
 *  • Photos live in /public/images. The included sample photos are CC0
 *    (see public/images/CREDITS.md). Swap in the couple's own photos.
 *  • Music (e.g. a shehnai track) lives in /public/audio.
 */

export type Photo = { src: string; alt: string; width: number; height: number };
export type WeddingEvent = {
  id: string;
  name: string;
  hi: string;
  start: string;
  end: string;
  venue: string;
  address: string;
  description: string;
  dressCode: string;
  /** Suggested outfit colours (any CSS colour) */
  palette: string[];
  /** Panel accent colour */
  accent: string;
  photo: Photo;
};

const img = (file: string, alt: string, width: number, height: number): Photo => ({ src: `/images/${file}`, alt, width, height });

export const wedding = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  timeZone: "Asia/Kolkata",

  bride: { firstName: "Aditi", fullName: "Aditi Sharma", hi: "अदिति" },
  groom: { firstName: "Vivaan", fullName: "Vivaan Mishra", hi: "विवान" },
  initials: { bride: "A", groom: "V" },
  hashtag: "#AditiKeVivaan",

  /** The shubh muhurat for the pheras. The countdown targets this. */
  weddingDate: "2027-11-26T19:41:00+05:30",
  muhuratNote: "Shubh muhurat for the pheras: 7:41 PM (Godhuli Lagna)",
  city: "Varanasi",
  cityHi: "वाराणसी",

  invitation: {
    blessing: "|| श्री गणेशाय नमः ||",
    title: "Shubh Vivah",
    titleHi: "शुभ विवाह",
    line: "Together with their families, invite you to bless them as they take the seven sacred steps",
    lotusLine: "Tap the lotus to begin",
  },

  /** Ganesh vandana opening the invitation scroll */
  shloka: {
    text: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
    meaning: "O Lord Ganesha, of the curved trunk and mighty form, radiant as a million suns, remove all obstacles from every endeavour of ours, always.",
  },

  /** The unrolling invitation (nimantran patra) */
  nimantran: {
    hi: "सादर आमंत्रण",
    intro: "With the divine blessings of Lord Ganesha and our elders,",
    hosts: "Smt. Rekha & Shri Rajendra Sharma",
    request: "request the pleasure of your gracious presence on the auspicious occasion of the marriage of their daughter",
    groomLine: "son of Smt. Sunita & Shri Alok Mishra, Prayagraj",
    closing: "Your presence and blessings will make this occasion complete.",
    elders: "With blessings from: Late Shri Ram Narayan Sharma & Smt. Kaushalya Devi Sharma",
    swagatkarta: ["Sharma Parivar", "Mishra Parivar", "Shri Mukesh & Smt. Neelam Sharma", "Shri Rakesh & Smt. Anju Sharma"],
    darshanabhilashi: ["Aarav", "Diya", "Kabir", "Myra", "and all the little ones"],
  },

  music: {
    src: "/audio/bg-music.mp3",
    volume: 0.45,
    /** Never autoplays on load. If true, starts when the guest taps the lotus. */
    playOnOpen: true,
  },

  story: [
    {
      title: "A chance meeting on the ghats",
      date: "Dev Deepavali, 2021",
      text: "A million diyas floating on the Ganga, and two strangers who both stopped to photograph the same one. Vivaan offered to share his chai. Aditi said yes.",
      photo: img("ganga-diyas.jpg", "Diyas floating on the Ganges during Dev Deepavali", 1120, 840),
    },
    {
      title: "Hand in hand",
      date: "2022 – 2025",
      text: "Two families, many visits, endless rounds of sweets, and one very long list of shared favourite songs.",
      photo: img("couple-hands-bw.webp", "A couple holding hands, the bride's hands decorated with mehendi", 1024, 683),
    },
    {
      title: "Roka & the promise",
      date: "Basant Panchami, 2026",
      text: "With both families gathered and the priest's blessings, the rishta was sealed with laughter, laddoos and happy tears.",
      photo: img("shagun-hands.webp", "Hands exchanging a shagun gift", 1024, 683),
    },
  ],

  events: [
    {
      id: "ganesh",
      name: "Ganesh Puja & Tilak",
      hi: "गणेश पूजा",
      start: "2027-11-24T09:00:00+05:30",
      end: "2027-11-24T11:00:00+05:30",
      venue: "Sharma Niwas",
      address: "B-21, Lanka, Varanasi, Uttar Pradesh 221005",
      description: "We begin with prayers to Lord Ganesha to bless the celebrations ahead.",
      dressCode: "Traditional · yellows & creams",
      palette: ["#F6C945", "#FFF3D1", "#E9862A"],
      accent: "#E9862A",
      photo: img("rangoli-diyas.jpg", "A rangoli lit by diyas", 1280, 960),
    },
    {
      id: "haldi",
      name: "Haldi",
      hi: "हल्दी",
      start: "2027-11-24T12:00:00+05:30",
      end: "2027-11-24T15:00:00+05:30",
      venue: "The Courtyard, Ganga Ghat Haveli",
      address: "Dashashwamedh Ghat Road, Varanasi, Uttar Pradesh 221001",
      description: "Turmeric, rose petals and a lot of laughter. Wear something you don't mind turning yellow!",
      dressCode: "Shades of yellow",
      palette: ["#F7C71C", "#FFE27A", "#FFFFFF"],
      accent: "#E8B10E",
      photo: img("haldi-bowl.webp", "A bowl of haldi paste with rose petals", 1024, 683),
    },
    {
      id: "mehendi",
      name: "Mehendi",
      hi: "मेहंदी",
      start: "2027-11-24T17:00:00+05:30",
      end: "2027-11-24T21:00:00+05:30",
      venue: "Garden Terrace, Ganga Ghat Haveli",
      address: "Dashashwamedh Ghat Road, Varanasi, Uttar Pradesh 221001",
      description: "Henna artists, dholak songs and chaat counters as the sun sets over the Ganga.",
      dressCode: "Greens, pinks & florals",
      palette: ["#2E8B57", "#F28FB2", "#FBD34D"],
      accent: "#2E8B57",
      photo: img("mehendi-bangles.webp", "Hands with mehendi and colourful bangles", 1024, 487),
    },
    {
      id: "sangeet",
      name: "Sangeet",
      hi: "संगीत",
      start: "2027-11-25T19:00:00+05:30",
      end: "2027-11-25T23:30:00+05:30",
      venue: "Darbar Hall, Ganga Ghat Haveli",
      address: "Dashashwamedh Ghat Road, Varanasi, Uttar Pradesh 221001",
      description: "Family performances, a live band, and a dance-off between the bride's and groom's sides.",
      dressCode: "Indo-western glam",
      palette: ["#1F6F78", "#C8A2F0", "#D4AF37"],
      accent: "#7B3FA0",
      photo: img("floral-decor.webp", "A stage decorated with white and pink flowers", 684, 1024),
    },
    {
      id: "baraat",
      name: "Baraat",
      hi: "बारात",
      start: "2027-11-26T18:00:00+05:30",
      end: "2027-11-26T19:30:00+05:30",
      venue: "From Assi Ghat to Ganga Ghat Haveli",
      address: "Assi Ghat, Varanasi, Uttar Pradesh 221005",
      description: "Dhol, dancing and fireworks as the groom's procession arrives for the milni.",
      dressCode: "Safas provided · festive bright",
      palette: ["#E63946", "#F4A261", "#2A9D8F"],
      accent: "#D1495B",
      photo: img("fireworks.jpg", "Fireworks lighting up the night sky", 1200, 1600),
    },
    {
      id: "pheras",
      name: "Varmala & Pheras",
      hi: "जयमाला एवं फेरे",
      start: "2027-11-26T19:41:00+05:30",
      end: "2027-11-27T00:30:00+05:30",
      venue: "The Ghat-side Mandap, Ganga Ghat Haveli",
      address: "Dashashwamedh Ghat Road, Varanasi, Uttar Pradesh 221001",
      description: "Jaimala, Kanyadaan and the seven sacred pheras around the holy fire at the shubh muhurat.",
      dressCode: "Traditional · reds, golds & ivories",
      palette: ["#B3001B", "#D4AF37", "#FFF8EE"],
      accent: "#B3001B",
      photo: img("bride-namaste.webp", "A bride in a red lehenga with folded hands", 1024, 768),
    },
    {
      id: "reception",
      name: "Reception",
      hi: "स्वागत समारोह",
      start: "2027-11-27T19:30:00+05:30",
      end: "2027-11-27T23:30:00+05:30",
      venue: "The Grand Lawn, Ramada Plaza JHV",
      address: "The Mall, Cantonment, Varanasi, Uttar Pradesh 221002",
      description: "Dinner, music and blessings as we welcome you to celebrate our new beginning.",
      dressCode: "Formal / evening wear",
      palette: ["#0E3B43", "#D4AF37", "#FFFFFF"],
      accent: "#0E6E6E",
      photo: img("lehenga-gold.webp", "A gold embroidered lehenga", 683, 1024),
    },
  ] satisfies WeddingEvent[],

  /** Saptapadi: one vow revealed per phera in the 3D scene */
  vows: [
    { hi: "पहला फेरा", title: "For nourishment", text: "We will provide for each other and nourish our home with love." },
    { hi: "दूसरा फेरा", title: "For strength", text: "We will grow together in strength of body, mind and spirit." },
    { hi: "तीसरा फेरा", title: "For prosperity", text: "We will share our fortunes and work honestly for our family." },
    { hi: "चौथा फेरा", title: "For happiness", text: "We will cherish love, respect and harmony with both our families." },
    { hi: "पाँचवाँ फेरा", title: "For our family", text: "We will care for our children and our elders with devotion." },
    { hi: "छठा फेरा", title: "For every season", text: "We will stand by each other in joy and in sorrow, for a long and healthy life." },
    { hi: "सातवाँ फेरा", title: "For friendship", text: "We will remain lifelong friends, partners and companions, in this life and the next seven." },
  ],

  /** A gentle guide for guests who are new to Hindu weddings */
  rituals: [
    { name: "Haldi", hi: "हल्दी", text: "Turmeric paste is applied to the couple for glowing skin and to ward off evil. Expect it to get messy!", photo: img("haldi-bowl.webp", "Haldi paste", 1024, 683) },
    { name: "Mehendi", hi: "मेहंदी", text: "Intricate henna is painted on the bride's hands and feet. Legend says the deeper the colour, the deeper the love.", photo: img("mehendi-hand.webp", "A hand with intricate mehendi", 931, 1024) },
    { name: "Jaimala", hi: "जयमाला", text: "The bride and groom exchange flower garlands, accepting each other as partners. Friends often lift them up to make it tricky!", photo: img("bride-bangles.webp", "A bride's bangles and red lehenga", 1024, 768) },
    { name: "Kanyadaan", hi: "कन्यादान", text: "The bride's parents place her hand in the groom's, entrusting him with her happiness. It is one of the most emotional moments.", photo: img("kalash-ritual.jpg", "Hands joined over a kalash during a ritual", 1280, 853) },
    { name: "Saat Phere", hi: "सात फेरे", text: "Tied together by the gathbandhan, the couple circle the sacred fire seven times, taking a vow with each round.", photo: img("rangoli-diya.webp", "A rangoli with a lit diya", 1024, 768) },
    { name: "Sindoor & Mangalsutra", hi: "सिंदूर", text: "The groom applies vermilion to the bride's hair parting and ties the mangalsutra, the sacred symbols of marriage.", photo: img("jewellery-hands.webp", "Hands with gold jewellery and bangles", 1024, 683) },
    { name: "Joota Chupai", hi: "जूता छुपाई", text: "A playful tradition: the bride's sisters hide the groom's shoes and negotiate a ransom to give them back!", photo: img("bride-feet.webp", "A bride's feet with alta and embroidered lehenga", 680, 1024) },
    { name: "Vidaai", hi: "विदाई", text: "The bride bids farewell to her family, throwing rice over her shoulder to wish prosperity on the home she leaves.", photo: img("ring-game.webp", "A post-wedding ring-finding game", 1024, 685) },
  ],

  venue: {
    name: "Ganga Ghat Haveli",
    address: "Dashashwamedh Ghat Road, Varanasi, Uttar Pradesh 221001, India",
    mapsQuery: "Dashashwamedh Ghat, Varanasi",
    photo: img("ganga-diyas.jpg", "Diyas floating on the Ganges", 1120, 840),
    /** Shown in the "Getting here" tabs */
    travel: [
      { mode: "By air", icon: "✈", text: "Lal Bahadur Shastri International Airport (VNS) is ~45 minutes from the venue. Share your flight in the RSVP and we'll arrange pickup." },
      { mode: "By train", icon: "🚆", text: "Varanasi Junction (BSB) and Banaras (BSBS) stations are 20–25 minutes away. We'll have cars waiting." },
      { mode: "By road", icon: "🚗", text: "Varanasi is 2.5 hours from Prayagraj by the NH19. The old city lanes are narrow, so use the parking at Godowlia and take our shuttle." },
    ],
    stay: "Rooms are reserved at the haveli and at Ramada Plaza JHV for outstation guests. Mention \"Sharma–Mishra wedding\" when booking.",
    weather: "Late November in Varanasi is pleasant by day (25°C) and chilly at night (12°C). Carry a shawl for the ghat-side pheras.",
  },

  gallery: [
    img("bride-namaste.webp", "Folded hands in red", 1024, 768),
    img("mehendi-hand.webp", "The mehendi", 931, 1024),
    img("lehenga-gold.webp", "Golden embroidery", 683, 1024),
    img("bride-bangles.webp", "Chooda & bangles", 1024, 768),
    img("floral-decor.webp", "Floral décor", 684, 1024),
    img("jewellery-hands.webp", "Kundan & gold", 1024, 683),
    img("mehendi-plate.webp", "Mehendi ceremony", 1024, 683),
    img("bride-feet.webp", "Alta & payal", 680, 1024),
    img("kalash-ritual.jpg", "The kalash", 1280, 853),
    img("rangoli-diya.webp", "Rangoli", 1024, 768),
    img("couple-hands-bw.webp", "Together", 1024, 683),
    img("shagun-hands.webp", "Shagun", 1024, 683),
  ] satisfies Photo[],

  families: {
    bride: { title: "Bride's family", hi: "कन्या पक्ष", parents: "Smt. Rekha & Shri Rajendra Sharma", home: "Varanasi", siblings: "Riya Sharma (sister) · Karan Sharma (brother)" },
    groom: { title: "Groom's family", hi: "वर पक्ष", parents: "Smt. Sunita & Shri Alok Mishra", home: "Prayagraj", siblings: "Ishaan Mishra (brother) · Tanvi Mishra (sister)" },
  },

  guestNotes: [
    { title: "Shagun & gifts", text: "Your blessings are our greatest gift. If you wish to give shagun, a blessing envelope box will be at the reception." },
    { title: "Food", text: "All meals are vegetarian. Jain food is available at every event; just let us know in your RSVP." },
    { title: "At the mandap", text: "Please remove your shoes near the mandap and keep phones on silent during the pheras." },
    { title: "Safas & bangles", text: "Safas for the baraat and bangles for the mehendi will be handed out at the venue." },
  ],

  rsvp: {
    deadline: "2027-10-31T23:59:00+05:30",
    /** WhatsApp number in international format, digits only */
    whatsappNumber: "919415012345",
    maxGuests: 6,
    endpoint: "/api/rsvp",
    dietOptions: ["Vegetarian", "Jain", "Vegan", "No onion-garlic"],
  },

  contacts: [
    { name: "Karan Sharma", role: "Bride's brother", phone: "+91 94150 12345" },
    { name: "Ishaan Mishra", role: "Groom's brother", phone: "+91 98390 67890" },
  ],

  footer: {
    blessing: "सदा सौभाग्यवती भव",
    blessingMeaning: "May you be blessed with good fortune, always.",
    thankYou: "With folded hands, we thank you for your love and blessings. We can't wait to celebrate with you in Kashi.",
  },

  seo: {
    title: "Aditi & Vivaan: Shubh Vivah",
    description: "You're invited! Bless Aditi & Vivaan as they take the seven sacred pheras on the ghats of Varanasi, 26 November 2027. Tap to open the invitation.",
  },
};

export type WeddingConfig = typeof wedding;
