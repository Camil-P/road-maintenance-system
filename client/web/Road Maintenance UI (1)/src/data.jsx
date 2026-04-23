// Seed data for OfferForAgencies.md screenshots — Novi Pazar, RS (MapLibre, OSM tiles, no API keys).

const CITY_CENTER = [20.5125, 43.1367]; // [lng, lat]

/** Prikaz u UI / prijava — skladno sa opisom u ponudi (rupa, led, znak, signalizacija, krupi, voda, rasveta). */
const INCIDENT_TYPES = [
  { id: 'pothole', label: 'Rupa u kolovozu',      icon: 'Construction', color: '#E5484D', tint: 'pothole' },
  { id: 'ice',     label: 'Led / sneg (klizavo)',  icon: 'Snowflake',    color: '#4CC2FF', tint: 'ice' },
  { id: 'sign',    label: 'Nedostaje / oboren znak', icon: 'Signpost',   color: '#F5A524', tint: 'sign' },
  { id: 'debris',  label: 'Krupi / predmet na putu', icon: 'Trash2',     color: '#7C5CFF', tint: 'debris' },
  { id: 'flood',   label: 'Voda / odvod',          icon: 'Droplets',     color: '#2563EB', tint: 'ice' },
  { id: 'light',   label: 'Neispravna signaliz. / rasveta', icon: 'LightbulbOff', color: '#111216', tint: 'debris' },
];

/**
 * Incidenti sa terena — gusto raspoređeni za screenshoot „mape: radovi + prijave“.
 * reportedBy: community = građanin/vozač, city = potvrđeno / nadzor.
 */
const HAZARDS = [
  { id: 'h1', type: 'pothole', lng: 20.5158, lat: 43.1361, note: 'Duboka rupa pored pešačkog, ograničiti brzinu',   reportedBy: 'community', minsAgo: 8   },
  { id: 'h2', type: 'ice',     lng: 20.5068, lat: 43.1408, note: 'Crn led — opasan prilaz kružnom toku',            reportedBy: 'city',      minsAgo: 31  },
  { id: 'h3', type: 'sign',    lng: 20.5197, lat: 43.1332, note: 'Znak "Stop" oboren, loša vidljivost raskrsnice',  reportedBy: 'community', minsAgo: 55  },
  { id: 'h4', type: 'debris',  lng: 20.5033, lat: 43.1341, note: 'Guma u desnoj traci, potrebno uklanjanje',        reportedBy: 'community', minsAgo: 4   },
  { id: 'h5', type: 'pothole', lng: 20.5098, lat: 43.1391, note: 'Grupa rupa nakon ledenog perioda, prioritet asfalta', reportedBy: 'city',  minsAgo: 118 },
  { id: 'h6', type: 'flood',   lng: 20.5112, lat: 43.1308, note: 'Zadržana voda — uski odvod, rizik prskanja',   reportedBy: 'community', minsAgo: 19  },
  { id: 'h7', type: 'light',   lng: 20.5210, lat: 43.1375, note: 'Semafor treperi; konfliktni smer pojačan',         reportedBy: 'city',      minsAgo: 42  },
];

/**
 * Vesti / obaveštenja — planirani radovi, zatvaranje, preusmerenje, posebni režim (za sliku tickera + prošireni spisak).
 */
const NEWS = [
  { id: 'n1', severity: 'closure', headline: 'Zatvaranje puta: Bulevar 12. februar (od raskrsnice do mosta)',     detail: 'Hitan zahvat na kanalizaciji — preusmerenje kroz ulicu 7. jula, očekivano trajanje do petka 16:00.' },
  { id: 'n2', severity: 'alert',   headline: 'Upozorenje: klizav kolovoz u okolini mosta (soljenje u toku)',     detail: 'Ekipa na terenu. Smanjite brzinu, povećan razmak.' },
  { id: 'n3', severity: 'info',    headline: 'Planirano asfaltiranje: noću obilaznica (jedna traka zatvorena)',  detail: 'Radovi 22:00–5:00; alternativne trase označene privremenim znakovima.' },
  { id: 'n4', severity: 'alert',   headline: 'Preusmerenje: centar grada zbog dečije manifestacije u subotu',    detail: 'Jednosmeran režim i privremene zabrane stajanja; pratite obilaznicu prema 13. julu.' },
  { id: 'n5', severity: 'info',    headline: 'Ažurirano: završeni radovi na horizontalnoj signalizaciji u Staroj čaršiji', detail: 'Privremene oznake uklonjene; očekujte pojačan nadzor održavanja.' },
];

/** Deonice radova: kratki naslovi, ekipe i status — za mape (linije) + detalj u „peek“ kartici. */
const WORK_SEGMENTS = [
  {
    id: 'w1',
    title: 'Asfaltiranje — ulica 13. jula',
    crew: 'Ekipa asfalterska br. 3 (kamion miješalica, valjak)',
    status: 'active',
    severity: 'major',
    startsAt: 'Sada',
    endsAt: 'pet 18:00',
    detail: 'Freziranje i novi asfalt. Jedna traka, kašnjenje oko 10–15 min; obilazak kroz susedne ulice.',
    coords: [
      [20.5098, 43.1366],
      [20.5127, 43.1368],
      [20.5156, 43.1370],
      [20.5183, 43.1372],
    ],
  },
  {
    id: 'w2',
    title: 'Zatvaranje u jednom smeru — remont na mostu (preusmerenje preko obilaznice)',
    crew: 'Gradsko preduzeće za puteve — terenska ekipa br. 2',
    status: 'active',
    severity: 'closure',
    startsAt: 'Pon 8:00',
    endsAt: 'Sre 16:00',
    detail: 'Most: potpuno zatvoren u jednom smeru. Obilazak preko obilaznice; pratite saobraćajne znake.',
    coords: [
      [20.5228, 43.1416],
      [20.5213, 43.1408],
      [20.5198, 43.1401],
    ],
  },
  {
    id: 'w3',
    title: 'Noćni radovi — kanalizacija, Stara čaršija',
    crew: 'JP „Vodovod“ — održavanje mreže',
    status: 'scheduled',
    severity: 'minor',
    startsAt: 'Večeras 22:00',
    endsAt: 'Sutra 5:00',
    detail: 'Jedna traka zatvorena. Poseban noćni režim; smanjena buka nakon 24:00.',
    coords: [
      [20.5048, 43.1431],
      [20.5063, 43.1424],
      [20.5080, 43.1416],
    ],
  },
  {
    id: 'w4',
    title: 'Patrola puta + označavanje — obilaznica (GPS vozilo)',
    crew: 'Dispečer: vozilo oznake „PG-12“ (teren)',
    status: 'active',
    severity: 'minor',
    startsAt: '8:00',
    endsAt: '16:00',
    detail: 'Ekipa obilazi dodeljenu rutu, osvežava privremenu signalizaciju; raport u realnom vremenu.',
    coords: [
      [20.5005, 43.1355],
      [20.5032, 43.1352],
      [20.5058, 43.1350],
      [20.5085, 43.1353],
    ],
  },
];

/**
 * Moje prijave — statusi za „primljena → ekipa → sanirano“ (screenshoot liste prijava + mape).
 * received | in_progress | resolved
 */
const MY_REPORTS = [
  { id: 'r1', type: 'pothole', status: 'in_progress',  submitted: 'pre 2 dana',   address: 'Ulica 13. jula br. 8',           note: 'Velika rupa pored stajališta, opasno za točkove' },
  { id: 'r2', type: 'sign',    status: 'resolved',     submitted: 'pre 8 dana',  address: 'Trg slobode / ugao sa 7. jula',  note: 'Nedostaje znak ustupljenja nakon zime' },
  { id: 'r3', type: 'light',   status: 'received',     submitted: 'pre 3 časa',  address: 'Bulevar 12. februar',            note: 'Ulična lampa treperi, mesta slabog osvetljenja' },
  { id: 'r4', type: 'debris',  status: 'in_progress',  submitted: 'juče uveče',  address: 'Obilaznica (prva traka)',        note: 'Krupi posle vozila — traži se čišćenje trake' },
];

window.CITY_CENTER = CITY_CENTER;
window.INCIDENT_TYPES = INCIDENT_TYPES;
window.HAZARDS = HAZARDS;
window.NEWS = NEWS;
window.MY_REPORTS = MY_REPORTS;
window.WORK_SEGMENTS = WORK_SEGMENTS;
