import type {
  Hazard,
  IncidentType,
  MyReport,
  NewsItem,
  WorkSegment,
} from "./types";

/** [lng, lat] — Novi Pazar, Srbija (Trg Stefana Nemanje, centar) */
export const CITY_CENTER: [number, number] = [20.5125, 43.1367];

export const INCIDENT_TYPES: IncidentType[] = [
  { id: "pothole", label: "Rupa u putu", icon: "Construction", color: "#E5484D", tint: "pothole" },
  { id: "ice", label: "Led / sneg", icon: "Snowflake", color: "#4CC2FF", tint: "ice" },
  { id: "sign", label: "Oštećena signalizacija", icon: "Signpost", color: "#F5A524", tint: "sign" },
  { id: "debris", label: "Otpad na kolovozu", icon: "Trash2", color: "#7C5CFF", tint: "debris" },
  { id: "flood", label: "Poplava / klizište", icon: "Droplets", color: "#2563EB", tint: "ice" },
  { id: "light", label: "Ne radi rasveta", icon: "LightbulbOff", color: "#111216", tint: "debris" },
];

/**
 * Hazardi raspoređeni po celom Novom Pazaru — centar, Stara čaršija,
 * Hadžet, Selakovac, Mur, Postenje, obilaznica, putevi ka Sjenici/Tutinu/Raškoj.
 */
export const HAZARDS: Hazard[] = [
  // Centar
  { id: "h1", type: "pothole", lng: 20.5158, lat: 43.1361, note: "Duboka rupa pored pešačkog prelaza", reportedBy: "community", minsAgo: 12 },
  { id: "h3", type: "sign",    lng: 20.5197, lat: 43.1332, note: 'Znak „Stop" oboren u udesu',         reportedBy: "community", minsAgo: 58 },
  { id: "h4", type: "light",   lng: 20.5108, lat: 43.1379, note: "Ulična rasveta van funkcije",        reportedBy: "community", minsAgo: 220 },

  // Stara čaršija / sever
  { id: "h5", type: "debris",  lng: 20.5066, lat: 43.1428, note: "Granje na kolovozu nakon vetra",     reportedBy: "community", minsAgo: 18 },
  { id: "h6", type: "ice",     lng: 20.5068, lat: 43.1408, note: "Poledica na prilazu mostu",          reportedBy: "city",      minsAgo: 34 },

  // Hadžet (jugozapad)
  { id: "h8", type: "flood",   lng: 20.4992, lat: 43.1318, note: "Manje klizište nakon kiše",          reportedBy: "city",      minsAgo: 95 },

  // Postenje / sever
  { id: "h14", type: "pothole", lng: 20.5142, lat: 43.1454, note: "Velika rupa — autobuska linija 5",  reportedBy: "community", minsAgo: 3 },
];

export const NEWS: NewsItem[] = [
  { id: "n1", severity: "closure", headline: "Ulica Stevana Nemanje zatvorena 3—5",      detail: "Hitan rad na vodovodu. Otvaranje očekivano u 18:00." },
  { id: "n2", severity: "alert",   headline: "Upozorenje: poledica na pristupu mostu",   detail: "Ekipa zimske službe trenutno soli kolovoz. Smanjite brzinu." },
  { id: "n3", severity: "info",    headline: "Asfaltiranje noću — Ulica 13. jula",       detail: "Jedna traka zatvorena 22:00 — 05:00." },
  { id: "n4", severity: "alert",   headline: "3 nove rupe prijavljene u vašem kraju",    detail: "Otvorite „Moje prijave\" za detalje." },
  { id: "n5", severity: "info",    headline: "Sanacija klizišta na obilaznici završena", detail: "Saobraćaj normalan u oba smera od 14:00." },
  { id: "n6", severity: "closure", headline: "Most preko Raške — zatvoren u smeru ka centru", detail: "Remont kolovoza. Obilaznica preko Sutjeske ulice." },
  { id: "n7", severity: "info",    headline: "Postavljena nova signalizacija — Hadžet",  detail: "Saobraćajni znaci postavljeni na 4 raskrsnice." },
  { id: "n8", severity: "alert",   headline: "Najavljeno nevreme — pripremite se",       detail: "Ekipe spremne za hitne intervencije do jutra." },
];

export const WORK_SEGMENTS: WorkSegment[] = [
  {
    id: "w1",
    title: "Asfaltiranje — Ulica Hilma Rožajca",
    crew: "Putevi NP · Asfalterska ekipa A",
    status: "active",
    severity: "major",
    startsAt: "U toku",
    endsAt: "pet 18:00",
    detail: "Freziranje i polaganje novog sloja. Jedna traka, kašnjenja 10–15 min.",
    coords: [
      [20.514627, 43.137490],
      [20.516232, 43.137876],
    ],
  },
  {
    id: "w2",
    title: "Sanacija kolovoza — krivina",
    crew: "Putevi NP · Asfalterska ekipa B",
    status: "active",
    severity: "major",
    startsAt: "U toku",
    endsAt: "sub 17:00",
    detail: "Krpljenje udarnih rupa i obnova horizontalne signalizacije.",
    coords: [
      [20.515708, 43.135041],
      [20.515708, 43.135041],
      [20.515128, 43.133826],
    ],
  },
  {
    id: "w3",
    title: "Zamena ivičnjaka — pristupna ulica",
    crew: "Putevi NP · Ekipa za održavanje",
    status: "scheduled",
    severity: "minor",
    startsAt: "Sutra 08:00",
    endsAt: "Sutra 16:00",
    detail: "Naizmenični propust vozila uz signalizaciju.",
    coords: [
      [20.501077, 43.139808],
      [20.501672, 43.138815],
    ],
  },
];

// export const WORK_SEGMENTS_OLD: WorkSegment[] = [
//   {
//     id: "w1",
//     title: "Asfaltiranje — Ulica 13. jula",
//     crew: "Putevi NP · Asfalterska ekipa A",
//     status: "active",
//     severity: "major",
//     startsAt: "U toku",
//     endsAt: "pet 18:00",
//     detail: "Freziranje i polaganje novog sloja. Jedna traka, kašnjenja 10–15 min.",
//     coords: [
//       [43.137439, 20.512552],
//       [43.137539, 20.512652],
//       [43.137639, 20.512752],
//     ],
//   },
//   {
//     id: "w2",
//     title: "Zamena kanalizacionih cevi — Stara čaršija",
//     crew: "JKP Vodovod i kanalizacija",
//     status: "scheduled",
//     severity: "minor",
//     startsAt: "Večeras 22:00",
//     endsAt: "Sutra 05:00",
//     detail: "Noćni radovi. Jedna traka zatvorena, lokalni saobraćaj omogućen.",
//     coords: [
//       [43.143152, 20.504852],
//       [43.142452, 20.506352],
//       [43.141652, 20.508052],
//     ],
//   },
//   {
//     id: "w3",
//     title: "Remont kolovoza — Most preko Raške",
//     crew: "Putevi NP · Asfalterska ekipa B",
//     status: "active",
//     severity: "closure",
//     startsAt: "Pon 08:00",
//     endsAt: "Sre 16:00",
//     detail: "Potpuno zatvoreno u jednom smeru. Obilaznica preko ulice Sutjeske.",
//     coords: [
//       [43.141652, 20.522852],
//       [43.140852, 20.521352],
//       [43.140152, 20.519852],
//     ],
//   },
//   {
//     id: "w4",
//     title: "Sanacija bankine — put ka Tutinu",
//     crew: "Putevi NP · Ekipa za održavanje 2",
//     status: "scheduled",
//     severity: "minor",
//     startsAt: "Sutra 09:00",
//     endsAt: "Sutra 16:00",
//     detail: "Naizmenični propust vozila uz signalizaciju.",
//     coords: [
//       [43.131852, 20.497852],
//       [43.132652, 20.499852],
//       [43.133452, 20.501852],
//     ],
//   },
//   {
//     id: "w5",
//     title: "Zamena javne rasvete — Selakovac",
//     crew: "Elektrodistribucija — javna rasveta",
//     status: "active",
//     severity: "minor",
//     startsAt: "U toku",
//     endsAt: "Sutra 12:00",
//     detail: "Zamena 6 LED reflektora. Zauzeta ivična traka.",
//     coords: [
//       [43.139152, 20.524652],
//       [43.139852, 20.525852],
//       [43.140452, 20.527252],
//     ],
//   },
//   {
//     id: "w6",
//     title: "Hitna intervencija — odron Hadžet",
//     crew: "Putevi NP · Hitna ekipa",
//     status: "active",
//     severity: "closure",
//     startsAt: "Sada",
//     endsAt: "Procena u 18:00",
//     detail: "Obrušeni materijal sa kosine. Saobraćaj obustavljen u oba smera.",
//     coords: [
//       [43.132052, 20.498852],
//       [43.131452, 20.499852],
//       [43.130852, 20.500852],
//     ],
//   },
//   {
//     id: "w7",
//     title: "Obeležavanje horizontalne signalizacije",
//     crew: "Putevi NP · Signalizacija",
//     status: "scheduled",
//     severity: "minor",
//     startsAt: "Sub 06:00",
//     endsAt: "Sub 14:00",
//     detail: "Bulevar 12. februar — obeležavanje pešačkih prelaza i traka.",
//     coords: [
//       [20.5142, 43.1340],
//       [20.5168, 43.1348],
//       [20.5194, 43.1356],
//       [20.5220, 43.1362],
//     ],
//   },
// ];

export const MY_REPORTS: MyReport[] = [
  {
    id: "r1",
    type: "pothole",
    status: "in_progress",
    submitted: "pre 2 dana",
    address: "Ulica 13. jula br. 8",
    note: "Velika rupa pored autobuskog stajališta",
  },
  {
    id: "r2",
    type: "sign",
    status: "resolved",
    submitted: "pre nedelju dana",
    address: "Trg slobode / Ulica 7. jula",
    note: "Nedostajao znak prvenstva prolaza",
  },
  {
    id: "r3",
    type: "light",
    status: "received",
    submitted: "pre 3 sata",
    address: "Bulevar 12. februar br. 22",
    note: "Ulična lampa treperi celu noć",
  },
  {
    id: "r4",
    type: "debris",
    status: "in_progress",
    submitted: "juče",
    address: "Obilaznica — izlaz ka Tutinu",
    note: "Granje na desnoj traci",
  },
  {
    id: "r5",
    type: "pothole",
    status: "resolved",
    submitted: "pre 12 dana",
    address: "Ulica Stevana Nemanje br. 4",
    note: "Saniran udar pored autobuskog stajališta",
  },
  {
    id: "r6",
    type: "ice",
    status: "resolved",
    submitted: "prošle nedelje",
    address: "Most preko Raške",
    note: "Ekipa zimske službe je posula put",
  },
  {
    id: "r7",
    type: "flood",
    status: "in_progress",
    submitted: "pre 5 sati",
    address: "Ulica Hadžetska br. 17",
    note: "Slivnik začepljen — voda na kolovozu",
  },
  {
    id: "r8",
    type: "sign",
    status: "received",
    submitted: "jutros",
    address: "Selakovac — krivina kod škole",
    note: "Nedostaje znak za ograničenje brzine 30",
  },
];
