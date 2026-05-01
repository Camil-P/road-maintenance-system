import type {
  AdminNewsItem,
  NewsAudience,
  NewsSeverity,
  NewsStatus,
} from "./types";

export const SEVERITY_LABEL: Record<NewsSeverity, string> = {
  closure: "Zatvoreno",
  alert: "Upozorenje",
  info: "Informacija",
  works: "Radovi",
};

export const SEVERITY_COLOR: Record<NewsSeverity, string> = {
  closure: "#E5484D",
  alert: "#F5A524",
  info: "#0F7AB3",
  works: "#FF5A1F",
};

export const STATUS_LABEL: Record<NewsStatus, string> = {
  published: "Objavljeno",
  draft: "Nacrt",
  scheduled: "Zakazano",
  archived: "Arhivirano",
};

export const AUDIENCE_LABEL: Record<NewsAudience, string> = {
  all: "Svi korisnici",
  drivers: "Vozači",
  residents: "Stanovnici",
  internal: "Interno (ekipe)",
};

export const ADMIN_NEWS: AdminNewsItem[] = [
  {
    id: "n1",
    severity: "closure",
    status: "published",
    audience: "all",
    headline: "Ulica Stevana Nemanje zatvorena 15:00 — 18:00",
    detail:
      "Hitan rad na vodovodnoj instalaciji. Obilaznica preko ulice 13. jula. Pratite preusmeravanja.",
    publishedAt: "danas 09:14",
    expiresAt: "danas 18:00",
    views: 4218,
    reach: 5102,
    pinned: true,
    author: { name: "Aleksandar P.", initials: "AP" },
    region: "Centar",
  },
  {
    id: "n2",
    severity: "alert",
    status: "published",
    audience: "drivers",
    headline: "Upozorenje: poledica na pristupu mostu",
    detail:
      "Ekipa zimske službe trenutno soli kolovoz. Smanjite brzinu i držite odstojanje.",
    publishedAt: "danas 07:48",
    expiresAt: "danas 12:00",
    views: 2740,
    reach: 3960,
    author: { name: "Dispečer · Vladan K.", initials: "VK" },
    region: "Most preko Raške",
  },
  {
    id: "n3",
    severity: "works",
    status: "scheduled",
    audience: "drivers",
    headline: "Asfaltiranje noću — Ulica 13. jula",
    detail:
      "Jedna traka zatvorena 22:00 — 05:00. Lokalni saobraćaj omogućen, koristite Karađorđevu kao obilaznicu.",
    scheduledFor: "danas 21:30",
    expiresAt: "sutra 05:00",
    views: 0,
    reach: 0,
    author: { name: "Aleksandar P.", initials: "AP" },
    region: "13. jula",
  },
  {
    id: "n4",
    severity: "info",
    status: "published",
    audience: "all",
    headline: "Sanacija klizišta na obilaznici završena",
    detail: "Saobraćaj normalizovan u oba smera od 14:00. Hvala na strpljenju.",
    publishedAt: "juče 14:08",
    views: 6312,
    reach: 7220,
    author: { name: "Aleksandar P.", initials: "AP" },
    region: "Obilaznica",
  },
  {
    id: "n5",
    severity: "alert",
    status: "draft",
    audience: "all",
    headline: "Najavljeno nevreme — pripremite se",
    detail:
      "Po prognozi, jak vetar i kiša u toku noći. Ekipe spremne za hitne intervencije do jutra.",
    views: 0,
    reach: 0,
    author: { name: "Marija T. · komunikacije", initials: "MT" },
    region: "Region",
  },
  {
    id: "n6",
    severity: "closure",
    status: "published",
    audience: "drivers",
    headline: "Most preko Raške — zatvoren u smeru ka centru",
    detail:
      "Remont kolovoza. Obilaznica preko Sutjeske ulice. Trajanje: do srede 16:00.",
    publishedAt: "pre 2 dana 06:30",
    expiresAt: "sreda 16:00",
    views: 9210,
    reach: 11430,
    pinned: true,
    author: { name: "Aleksandar P.", initials: "AP" },
    region: "Most preko Raške",
  },
  {
    id: "n7",
    severity: "info",
    status: "archived",
    audience: "residents",
    headline: "Postavljena nova signalizacija — Hadžet",
    detail: "Saobraćajni znaci postavljeni na 4 raskrsnice. Vozite oprezno.",
    publishedAt: "pre 11 dana",
    views: 1840,
    reach: 2310,
    author: { name: "Marija T. · komunikacije", initials: "MT" },
    region: "Hadžet",
  },
];
