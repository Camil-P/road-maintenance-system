import type {
  Hazard,
  IncidentType,
  MyReport,
  NewsItem,
  WorkSegment,
} from "./types";

/** [lng, lat] — Novi Pazar, Srbija */
export const CITY_CENTER: [number, number] = [20.5125, 43.1367];

export const INCIDENT_TYPES: IncidentType[] = [
  { id: "pothole", label: "Rupa u putu", icon: "Construction", color: "#E5484D", tint: "pothole" },
  { id: "ice", label: "Led / sneg", icon: "Snowflake", color: "#4CC2FF", tint: "ice" },
  { id: "sign", label: "Nedostaje znak", icon: "Signpost", color: "#F5A524", tint: "sign" },
  { id: "debris", label: "Krupi na putu", icon: "Trash2", color: "#7C5CFF", tint: "debris" },
  { id: "flood", label: "Poplava", icon: "Droplets", color: "#2563EB", tint: "ice" },
  { id: "light", label: "Ne radi rasveta", icon: "LightbulbOff", color: "#111216", tint: "debris" },
];

export const HAZARDS: Hazard[] = [
  { id: "h1", type: "pothole", lng: 20.5158, lat: 43.1361, note: "Duboka rupa pored pešačkog", reportedBy: "community", minsAgo: 12 },
  { id: "h2", type: "ice", lng: 20.5068, lat: 43.1408, note: "Crn led pristup mostu", reportedBy: "city", minsAgo: 34 },
  { id: "h3", type: "sign", lng: 20.5197, lat: 43.1332, note: 'Znak "Stop" oboren', reportedBy: "community", minsAgo: 58 },
  { id: "h4", type: "debris", lng: 20.5033, lat: 43.1341, note: "Guma u desnoj traci", reportedBy: "community", minsAgo: 7 },
  { id: "h5", type: "pothole", lng: 20.5098, lat: 43.1391, note: "Grupa rupa u kolovozu", reportedBy: "city", minsAgo: 121 },
];

export const NEWS: NewsItem[] = [
  { id: "n1", severity: "closure", headline: "Ulica Svetosavska zatvorena — Trg do Park", detail: "Hitan rad na vodovodu — očekivano otvaranje u 18:00" },
  { id: "n2", severity: "alert", headline: "Upozorenje: crn led — pristup mostu", detail: "Ekipa soli put. Smanjite brzinu." },
  { id: "n3", severity: "info", headline: "Asfaltiranje noću — centar", detail: "Jedna traka zatvorena 22:00–5:00" },
  { id: "n4", severity: "alert", headline: "3 nove rupe u blizini", detail: 'Otvorite „Moj kraj“ za prikaz' },
];

export const WORK_SEGMENTS: WorkSegment[] = [
  {
    id: "w1",
    title: "Asfaltiranje — Ulica 13. jula",
    crew: "Ekipa asfalterska br. 3",
    status: "active",
    severity: "major",
    startsAt: "Sada",
    endsAt: "pet 18:00",
    detail: "Freziranje i novi asfalt. Jedna traka, oko 10–15 min kašnjenja.",
    coords: [
      [20.5098, 43.1366],
      [20.5127, 43.1368],
      [20.5156, 43.137],
      [20.5183, 43.1372],
    ],
  },
  {
    id: "w2",
    title: "Radovi na kanalizaciji — Stara čaršija",
    crew: "JP Vodovod",
    status: "scheduled",
    severity: "minor",
    startsAt: "Večeras 22:00",
    endsAt: "Sutra 5:00",
    detail: "Noćni radovi. Jedna traka zatvorena.",
    coords: [
      [20.5048, 43.1431],
      [20.5063, 43.1424],
      [20.508, 43.1416],
    ],
  },
  {
    id: "w3",
    title: "Remont kolovoza na mostu",
    crew: "Gradsko preduzeće",
    status: "active",
    severity: "closure",
    startsAt: "Pon 8:00",
    endsAt: "Sre 16:00",
    detail: "Most — potpuno zatvoren u jednom smeru. Koristite obilaznicu.",
    coords: [
      [20.5228, 43.1416],
      [20.5213, 43.1408],
      [20.5198, 43.1401],
    ],
  },
];

export const MY_REPORTS: MyReport[] = [
  { id: "r1", type: "pothole", status: "in_progress", submitted: "pre 2 dana", address: "Ulica 13. jula br. 8", note: "Velika rupa pored stajališta" },
  { id: "r2", type: "sign", status: "resolved", submitted: "pre nedelju dana", address: "Trg slobode i 7. jula", note: "Nedostaje znak ustupljenja" },
  { id: "r3", type: "light", status: "received", submitted: "pre 3 časa", address: "Bulevar 12. februar", note: "Ulična lampa treperi" },
];
