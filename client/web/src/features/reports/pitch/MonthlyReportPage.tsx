import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardSignature,
  Coins,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Mail,
  MapPin,
  Printer,
  Route,
  Share2,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { MapCanvas } from "@/features/map/citizen/MapCanvas";
import { CITY_CENTER, INCIDENT_TYPES, WORK_SEGMENTS } from "@/features/map/citizen/data";
import type { Hazard, IncidentTypeId, UserLocation } from "@/features/map/citizen/types";
import { Icons } from "@/features/map/citizen/icons";
import { AGENCY_INCIDENTS } from "@/features/incidents/pitch/mockData";

const MONTH_LABEL = "April 2026";
const REGION_LABEL = "Region · Novi Pazar";
const REPORT_NO = "RPT-2026-04-NPZ";
const ISSUED_AT = "01.05.2026.";

interface KpiData {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  good: boolean;
  icon: React.ReactNode;
}

const KPIS: KpiData[] = [
  {
    label: "Ukupno prijava",
    value: "187",
    delta: "+12% u odnosu na mart",
    up: true,
    good: true,
    icon: <ClipboardSignature size={14} />,
  },
  {
    label: "Rešeno u roku",
    value: "94%",
    delta: "+6 p.p.",
    up: true,
    good: true,
    icon: <CheckCircle2 size={14} />,
  },
  {
    label: "Prosečno vreme odziva",
    value: "42 min",
    delta: "−18%",
    up: false,
    good: true,
    icon: <Calendar size={14} />,
  },
  {
    label: "Ukupan trošak",
    value: "14.380 €",
    delta: "−4% vs plan",
    up: false,
    good: true,
    icon: <Coins size={14} />,
  },
];

interface TypeRow {
  id: IncidentTypeId;
  count: number;
  closed: number;
  avgHours: number;
  cost: number;
}

const TYPE_BREAKDOWN: TypeRow[] = [
  { id: "pothole", count: 78, closed: 71, avgHours: 8.4, cost: 6240 },
  { id: "sign", count: 32, closed: 30, avgHours: 4.2, cost: 1860 },
  { id: "ice", count: 24, closed: 24, avgHours: 1.8, cost: 1320 },
  { id: "debris", count: 21, closed: 20, avgHours: 1.2, cost: 740 },
  { id: "flood", count: 18, closed: 16, avgHours: 12.5, cost: 2480 },
  { id: "light", count: 14, closed: 11, avgHours: 22.0, cost: 1740 },
];

const CREW_PERFORMANCE = [
  { name: "Asfalterska ekipa A", orders: 32, hours: 142, onTime: 96, cost: 4480 },
  { name: "Asfalterska ekipa B", orders: 28, hours: 134, onTime: 89, cost: 4120 },
  { name: "Hitna intervencija", orders: 22, hours: 78, onTime: 100, cost: 2240 },
  { name: "Signalizacija", orders: 18, hours: 64, onTime: 94, cost: 1180 },
  { name: "Zimska služba 1", orders: 14, hours: 96, onTime: 92, cost: 1620 },
  { name: "Ekipa za održavanje", orders: 24, hours: 88, onTime: 87, cost: 740 },
];

const HOTSPOTS = [
  { rank: 1, name: "Bulevar 12. februar", incidents: 27, change: "+8" },
  { rank: 2, name: "Selakovac — krivina kod škole", incidents: 19, change: "+4" },
  { rank: 3, name: "Most preko Raške — pristup", incidents: 14, change: "−2" },
  { rank: 4, name: "Hadžetska ulica", incidents: 11, change: "+1" },
  { rank: 5, name: "Stara čaršija", incidents: 9, change: "0" },
  { rank: 6, name: "Obilaznica · izlaz Tutin", incidents: 6, change: "−3" },
  { rank: 7, name: "Postenje · autobuska 5", incidents: 5, change: "+2" },
];

const COST_BREAKDOWN = [
  { label: "Materijali", value: 6240, color: "#FF5A1F" },
  { label: "Rad ekipa", value: 5180, color: "#0F7AB3" },
  { label: "Vozila i gorivo", value: 1820, color: "#7C5CFF" },
  { label: "Eksterni izvođači", value: 740, color: "#F5A524" },
  { label: "Materijali — zimska služba", value: 400, color: "#2BB673" },
];

const DAILY_REPORTS = [
  10, 4, 7, 8, 5, 6, 4, // wk1
  9, 12, 6, 8, 7, 4, 3, // wk2
  6, 8, 11, 7, 9, 5, 4, // wk3
  7, 9, 8, 6, 10, 8, 5, // wk4
  6, 4,
];

export function MonthlyReportPage() {
  const [showActions, setShowActions] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const cleanFromUrl = searchParams.get("clean") === "1";
  const [clean, setClean] = useState(cleanFromUrl);

  useEffect(() => {
    setClean(cleanFromUrl);
  }, [cleanFromUrl]);

  // Keyboard shortcut: Cmd/Ctrl+P → print, Cmd/Ctrl+Shift+H → toggle clean
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setClean((c) => {
          const next = !c;
          const sp = new URLSearchParams(searchParams);
          if (next) sp.set("clean", "1");
          else sp.delete("clean");
          setSearchParams(sp, { replace: true });
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchParams, setSearchParams]);

  const handlePrint = () => {
    setShowActions(false);
    // Small delay so dropdown closes before print dialog
    setTimeout(() => window.print(), 80);
  };

  const handleShareLink = () => {
    setShowActions(false);
    const url = `${window.location.origin}${window.location.pathname}?clean=1`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
  };

  const hazards: Hazard[] = useMemo(
    () =>
      AGENCY_INCIDENTS.map((i) => ({
        id: i.id,
        type: i.type,
        lng: i.lng,
        lat: i.lat,
        note: i.note,
        reportedBy: i.reporter.trust === "verified" ? "city" : "community",
        minsAgo: i.minsAgo,
      })),
    []
  );

  const userLocation: UserLocation = {
    lng: CITY_CENTER[0],
    lat: CITY_CENTER[1],
  };

  const totalIncidents = TYPE_BREAKDOWN.reduce((s, t) => s + t.count, 0);
  const totalClosed = TYPE_BREAKDOWN.reduce((s, t) => s + t.closed, 0);
  const totalCost = TYPE_BREAKDOWN.reduce((s, t) => s + t.cost, 0);

  return (
    <div
      className={`citizen-root min-h-[100dvh] w-full bg-ink-100 ${clean ? "report-clean" : ""}`}
      style={{ fontFamily: "Inter Tight, system-ui, sans-serif" }}
    >
      <div className="report-toolbar sticky top-0 z-30 bg-white border-b border-ink-100 px-6 py-3 flex items-center gap-4 print:hidden">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-ink-900 text-white grid place-items-center">
            <FileText size={18} />
          </span>
          <div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500 uppercase">
              Izveštaji · Mesečni
            </div>
            <div className="text-[15px] font-bold text-ink-900 leading-tight">
              {MONTH_LABEL} · {REGION_LABEL}
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 text-[12.5px] font-semibold hover:bg-ink-100">
            <Calendar size={13} /> Promeni period
            <ChevronDown size={12} className="opacity-60" />
          </button>
          <button
            onClick={() => {
              setClean(true);
              const sp = new URLSearchParams(searchParams);
              sp.set("clean", "1");
              setSearchParams(sp, { replace: true });
            }}
            title="Sakrij toolbar za screenshot (Cmd/Ctrl+Shift+H)"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 text-[12.5px] font-semibold hover:bg-ink-100"
          >
            <EyeOff size={13} /> Klean prikaz
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 text-[12.5px] font-semibold hover:bg-ink-100">
            <Mail size={13} /> Pošalji nadležnom
          </button>
          <div className="relative">
            <button
              onClick={() => setShowActions((s) => !s)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-brand-500 text-white text-[12.5px] font-bold shadow-fab hover:bg-brand-600"
            >
              <Download size={13} /> Preuzmi
              <ChevronDown size={12} className="opacity-80" />
            </button>
            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-64 rounded-xl bg-white ring-1 ring-ink-100 shadow-lift overflow-hidden text-ink-900 text-left">
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] hover:bg-ink-50"
                  >
                    <FileText size={14} className="text-signal-red" />
                    <div>
                      <div className="font-semibold">PDF (A4 · štampa)</div>
                      <div className="text-[10.5px] text-ink-400">
                        Otvara dijalog → „Sačuvaj kao PDF"
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowActions(false)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] hover:bg-ink-50 border-t border-ink-100 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <FileSpreadsheet size={14} className="text-signal-green" />
                    <div>
                      <div className="font-semibold">Excel (XLSX)</div>
                      <div className="text-[10.5px] text-ink-400">Uskoro</div>
                    </div>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] hover:bg-ink-50 border-t border-ink-100"
                  >
                    <Printer size={14} className="text-ink-700" />
                    <span className="font-semibold">Štampaj</span>
                  </button>
                  <button
                    onClick={handleShareLink}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] hover:bg-ink-50 border-t border-ink-100"
                  >
                    <Share2 size={14} className="text-ink-700" />
                    <div>
                      <div className="font-semibold">Kopiraj link</div>
                      <div className="text-[10.5px] text-ink-400">
                        Klean URL u clipboard
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {clean && (
        <button
          onClick={() => {
            setClean(false);
            const sp = new URLSearchParams(searchParams);
            sp.delete("clean");
            setSearchParams(sp, { replace: true });
          }}
          className="report-clean-restore fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white ring-1 ring-ink-200 shadow-soft text-ink-700 text-[12px] font-semibold hover:bg-ink-50 print:hidden"
          title="Vrati toolbar (Cmd/Ctrl+Shift+H)"
        >
          <Eye size={13} /> Vrati toolbar
        </button>
      )}

      <div className="report-page-bg px-6 py-8 flex justify-center">
        <article
          className="report-document bg-white rounded-2xl shadow-lift ring-1 ring-ink-100 w-full max-w-[920px] overflow-hidden"
          style={{ boxShadow: "0 30px 80px rgba(10,11,13,0.18), 0 4px 12px rgba(10,11,13,0.06)" }}
        >
          {/* Cover */}
          <div className="relative px-10 pt-10 pb-7 border-b border-ink-100">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 via-signal-amber to-signal-green" />
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-brand-500 uppercase">
                  Putevi NP · JKP za održavanje
                </div>
                <div className="text-[28px] font-bold text-ink-900 mt-1 leading-tight">
                  Mesečni izveštaj o stanju i radovima
                </div>
                <div className="text-[15px] text-ink-600 mt-1.5">
                  Period: {MONTH_LABEL} · {REGION_LABEL}
                </div>
              </div>
              <div className="text-right text-[11px] text-ink-400 font-semibold">
                <div className="font-mono">{REPORT_NO}</div>
                <div className="mt-1">Izdato: {ISSUED_AT}</div>
                <div className="mt-1 text-ink-500">Verzija 1.0 · Završeno</div>
              </div>
            </div>
          </div>

          {/* Executive summary */}
          <Section number="01" title="Izvršni pregled" subtitle="Ključni indikatori za period">
            <div className="grid grid-cols-4 gap-3">
              {KPIS.map((k) => (
                <div
                  key={k.label}
                  className="rounded-2xl bg-ink-50 ring-1 ring-ink-100 px-3.5 py-3"
                >
                  <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-ink-400 inline-flex items-center gap-1">
                    {k.icon} {k.label}
                  </div>
                  <div className="text-[24px] font-bold text-ink-900 leading-tight mt-0.5">
                    {k.value}
                  </div>
                  <div
                    className={`text-[10.5px] mt-1 inline-flex items-center gap-1 font-semibold ${
                      k.good ? "text-signal-green" : "text-signal-red"
                    }`}
                  >
                    {k.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {k.delta}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4 text-[12px] text-ink-700 leading-relaxed">
              <p>
                Tokom <strong>{MONTH_LABEL}</strong> u sistemu je registrovano{" "}
                <strong>{totalIncidents} prijava</strong>, od čega je{" "}
                <strong>{totalClosed} ({Math.round((totalClosed / totalIncidents) * 100)}%)</strong>{" "}
                zatvoreno do kraja perioda.
              </p>
              <p>
                Prosečno vreme od prijave do izlaska ekipe smanjeno je za{" "}
                <strong>18%</strong> zahvaljujući automatskoj triaži i pred-dodeli ekipa po regionu.
              </p>
              <p>
                Ukupan trošak intervencija iznosi <strong>{totalCost.toLocaleString("sr-RS")} €</strong>,
                što je <strong>4%</strong> ispod plana za april.
              </p>
            </div>
          </Section>

          {/* Map */}
          <Section number="02" title="Geografski pregled" subtitle="Prijave i radovi po deonicama">
            <div className="rounded-2xl overflow-hidden ring-1 ring-ink-100 relative h-[380px]">
              <MapCanvas
                hazards={hazards}
                workSegments={WORK_SEGMENTS}
                userLocation={userLocation}
                pendingLocation={null}
              />
              <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-start justify-between">
                <div className="bg-white/92 backdrop-blur-xl rounded-xl ring-1 ring-black/5 shadow-soft px-2.5 py-1.5 text-[11px]">
                  <div className="font-bold tracking-wide text-[10px] text-brand-500 uppercase">
                    {REGION_LABEL}
                  </div>
                  <div className="text-[12.5px] font-bold text-ink-900 leading-tight">
                    {totalIncidents} prijava · {WORK_SEGMENTS.length} aktivnih radilišta
                  </div>
                </div>
                <div className="bg-white/92 backdrop-blur-xl rounded-xl ring-1 ring-black/5 shadow-soft px-2.5 py-1.5 text-[10.5px] text-ink-600 flex items-center gap-2">
                  <LegendDot color="#E5484D" label="Hitno" />
                  <LegendDot color="#FF5A1F" label="Visoko" />
                  <LegendDot color="#9B9FAD" label="Normalno" />
                </div>
              </div>
            </div>
            <div className="mt-3 text-[11.5px] text-ink-500 leading-relaxed">
              Prikaz svih intervencija za period. Klizište na obilaznici i poledica na pristupu mostu označeni su kao prioritetni za sledeći mesec.
            </div>
          </Section>

          {/* Daily volume */}
          <Section number="03" title="Dinamika prijava" subtitle="Dnevni broj prijava tokom meseca">
            <DailyChart points={DAILY_REPORTS} />
            <div className="mt-3 grid grid-cols-4 gap-3 text-[11px]">
              <DailyStat label="Najviše" value="12 prijava" sub="9. april (četvrtak)" />
              <DailyStat label="Najmanje" value="3 prijave" sub="14. april (nedelja)" />
              <DailyStat label="Prosek" value="6.2 dnevno" sub={`${MONTH_LABEL.toLowerCase()}`} />
              <DailyStat label="Promena" value="+12%" sub="vs mart 2026" tone="text-signal-green" />
            </div>
          </Section>

          {/* Type breakdown */}
          <Section number="04" title="Aktivnosti po tipu" subtitle="Prijave, radni nalozi i prosečno vreme po vrsti">
            <div className="rounded-2xl ring-1 ring-ink-100 overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-ink-50 text-[10px] font-bold tracking-wide text-ink-400 uppercase">
                  <tr>
                    <th className="text-left px-4 py-2.5">Tip prijave</th>
                    <th className="text-right px-4 py-2.5">Broj</th>
                    <th className="text-right px-4 py-2.5">Zatvoreno</th>
                    <th className="text-right px-4 py-2.5">Stopa</th>
                    <th className="text-right px-4 py-2.5">Prosečno trajanje</th>
                    <th className="text-right px-4 py-2.5">Trošak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {TYPE_BREAKDOWN.map((t) => {
                    const meta =
                      INCIDENT_TYPES.find((x) => x.id === t.id) ?? INCIDENT_TYPES[0];
                    const Icon = Icons[meta.icon] ?? AlertTriangle;
                    const rate = Math.round((t.closed / t.count) * 100);
                    return (
                      <tr key={t.id} className="hover:bg-ink-50/50">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-7 w-7 rounded-lg grid place-items-center text-white"
                              style={{ background: meta.color }}
                            >
                              <Icon size={13} />
                            </span>
                            <span className="font-semibold text-ink-900">
                              {meta.label}
                            </span>
                          </div>
                        </td>
                        <td className="text-right px-4 py-2.5 tabular-nums font-bold text-ink-900">
                          {t.count}
                        </td>
                        <td className="text-right px-4 py-2.5 tabular-nums text-ink-700">
                          {t.closed}
                        </td>
                        <td className="text-right px-4 py-2.5">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-14 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-signal-green"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="tabular-nums text-ink-700 font-semibold">
                              {rate}%
                            </span>
                          </div>
                        </td>
                        <td className="text-right px-4 py-2.5 tabular-nums text-ink-700">
                          {t.avgHours.toFixed(1)} h
                        </td>
                        <td className="text-right px-4 py-2.5 tabular-nums text-ink-900 font-bold">
                          {t.cost.toLocaleString("sr-RS")} €
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-ink-50 text-[12px] font-bold">
                  <tr>
                    <td className="px-4 py-2.5">Ukupno</td>
                    <td className="text-right px-4 py-2.5 tabular-nums">{totalIncidents}</td>
                    <td className="text-right px-4 py-2.5 tabular-nums">{totalClosed}</td>
                    <td className="text-right px-4 py-2.5 tabular-nums">
                      {Math.round((totalClosed / totalIncidents) * 100)}%
                    </td>
                    <td className="text-right px-4 py-2.5 text-ink-500">—</td>
                    <td className="text-right px-4 py-2.5 tabular-nums">
                      {totalCost.toLocaleString("sr-RS")} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Section>

          {/* Crew performance + cost breakdown */}
          <Section
            number="05"
            title="Učinak ekipa i raspodela troškova"
            subtitle="Po ekipi i kategorijama troškova"
          >
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3 rounded-2xl ring-1 ring-ink-100 overflow-hidden">
                <div className="bg-ink-50 px-3 py-2 text-[10px] font-bold tracking-wide text-ink-400 uppercase inline-flex items-center gap-1">
                  <Users size={11} /> Učinak ekipa
                </div>
                <table className="w-full text-[11.5px]">
                  <thead className="bg-ink-50 text-[9.5px] font-bold tracking-wide text-ink-400 uppercase">
                    <tr>
                      <th className="text-left px-3 py-2">Ekipa</th>
                      <th className="text-right px-3 py-2">Naloga</th>
                      <th className="text-right px-3 py-2">Sati</th>
                      <th className="text-right px-3 py-2">U roku</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {CREW_PERFORMANCE.map((c) => (
                      <tr key={c.name}>
                        <td className="px-3 py-2 font-semibold text-ink-900 truncate">
                          {c.name}
                        </td>
                        <td className="text-right px-3 py-2 tabular-nums">{c.orders}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{c.hours}</td>
                        <td
                          className={`text-right px-3 py-2 tabular-nums font-bold ${
                            c.onTime >= 95
                              ? "text-signal-green"
                              : c.onTime >= 90
                                ? "text-signal-amber"
                                : "text-signal-red"
                          }`}
                        >
                          {c.onTime}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="col-span-2 rounded-2xl ring-1 ring-ink-100 p-4 flex flex-col">
                <div className="text-[10px] font-bold tracking-wide text-ink-400 uppercase inline-flex items-center gap-1">
                  <Coins size={11} /> Trošak po kategoriji
                </div>
                <DonutChart segments={COST_BREAKDOWN} />
                <div className="mt-3 space-y-1.5">
                  {COST_BREAKDOWN.map((c) => (
                    <div key={c.label} className="flex items-center text-[10.5px]">
                      <span
                        className="h-2 w-2 rounded-full mr-2"
                        style={{ background: c.color }}
                      />
                      <span className="text-ink-600 truncate flex-1">{c.label}</span>
                      <span className="font-semibold text-ink-900 tabular-nums">
                        {c.value.toLocaleString("sr-RS")} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Hotspots */}
          <Section number="06" title="Hotspot deonice" subtitle="Lokacije sa najviše prijava u periodu">
            <div className="rounded-2xl ring-1 ring-ink-100 overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-ink-50 text-[10px] font-bold tracking-wide text-ink-400 uppercase">
                  <tr>
                    <th className="text-left px-4 py-2.5">#</th>
                    <th className="text-left px-4 py-2.5">Deonica</th>
                    <th className="text-right px-4 py-2.5">Prijava</th>
                    <th className="text-right px-4 py-2.5">Promena vs mart</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {HOTSPOTS.map((h) => {
                    const trend = h.change.startsWith("+")
                      ? "up"
                      : h.change.startsWith("−")
                        ? "down"
                        : "flat";
                    return (
                      <tr key={h.rank}>
                        <td className="px-4 py-2.5 text-ink-400 tabular-nums font-bold">
                          {h.rank}
                        </td>
                        <td className="px-4 py-2.5 text-ink-900 font-semibold">
                          <span className="inline-flex items-center gap-2">
                            <Route size={12} className="text-ink-400" />
                            {h.name}
                          </span>
                        </td>
                        <td className="text-right px-4 py-2.5 tabular-nums">{h.incidents}</td>
                        <td className="text-right px-4 py-2.5">
                          <span
                            className={`inline-flex items-center gap-0.5 font-bold tabular-nums ${
                              trend === "up"
                                ? "text-signal-red"
                                : trend === "down"
                                  ? "text-signal-green"
                                  : "text-ink-500"
                            }`}
                          >
                            {trend === "up" && <ArrowUp size={11} />}
                            {trend === "down" && <ArrowDown size={11} />}
                            {h.change}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Resources summary */}
          <Section number="07" title="Stanje resursa" subtitle="Vozila, radnici i zalihe na kraju perioda">
            <div className="grid grid-cols-3 gap-4">
              <ResourceBox
                icon={<Truck size={14} />}
                title="Vozila"
                lines={[
                  ["Ukupno u floti", "10"],
                  ["Aktivno u operativi", "8"],
                  ["U servisu", "1"],
                  ["Predloženo otpisivanje", "1"],
                ]}
              />
              <ResourceBox
                icon={<Users size={14} />}
                title="Radnici"
                lines={[
                  ["Aktivnih u smeni", "12 / 15"],
                  ["Sertifikati ističu (90 dana)", "3"],
                  ["Prosečan staž", "10.4 g."],
                  ["Bolovanje / odmor", "2"],
                ]}
              />
              <ResourceBox
                icon={<Wrench size={14} />}
                title="Zalihe"
                lines={[
                  ["Vrednost zaliha", "23.200 €"],
                  ["Stavki ispod praga", "9"],
                  ["Kritično (hitno naručiti)", "3"],
                  ["Aktivnih depoa", "3"],
                ]}
              />
            </div>
          </Section>

          {/* Recommendations */}
          <Section number="08" title="Preporuke i prioriteti za maj">
            <ol className="space-y-2.5 text-[12.5px] text-ink-700 leading-relaxed">
              <Recommendation severity="high">
                <strong>Bulevar 12. februar</strong> — 27 prijava u mesecu (+8 vs mart). Predlog: planirati frezovanje i preasfaltiranje od km 0+200 do 1+850 u prvoj polovini maja.
              </Recommendation>
              <Recommendation severity="high">
                <strong>Selakovac — krivina kod škole</strong> označen kao crna tačka. Predlog: ugradnja zvučnih traka i zamena horizontalne signalizacije.
              </Recommendation>
              <Recommendation severity="medium">
                Topli asfalt i LED reflektori u kritičnim zalihama — narudžba do 5. maja kako se ne bi blokirale ekipe.
              </Recommendation>
              <Recommendation severity="medium">
                Kiper-2 (NP 112-QR) u servisu — proceniti opravdanost remonta vs nabavke novog vozila u Q3.
              </Recommendation>
              <Recommendation severity="low">
                3 sertifikata radnika ističu u narednih 90 dana (CPC vozača: 1, ZNR II: 1, MEH: 1) — pokrenuti obnovu.
              </Recommendation>
            </ol>
          </Section>

          {/* Footer / signatures */}
          <div className="px-10 pt-7 pb-8 border-t border-ink-100 bg-ink-50/40">
            <div className="grid grid-cols-3 gap-8">
              <SignatureBlock title="Sastavio izveštaj" name="Aleksandar Pavlović" role="Šef dispečerskog centra" />
              <SignatureBlock title="Pregledao" name="Jovana Stanković" role="Tehnička služba" />
              <SignatureBlock title="Odobrio" name="ime i prezime" role="Direktor" />
            </div>
            <div className="mt-6 flex items-center justify-between text-[10.5px] text-ink-400 pt-4 border-t border-ink-200">
              <div>
                {REPORT_NO} · generisano {ISSUED_AT} u 09:14 · sistem Putevi NP
              </div>
              <div className="font-mono">strana 1/1</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-10 py-7 border-b border-ink-100">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[11px] font-bold tracking-[0.2em] text-brand-500 font-mono">
          {number}
        </span>
        <div>
          <h2 className="text-[18px] font-bold text-ink-900 leading-tight">{title}</h2>
          {subtitle && <div className="text-[12px] text-ink-500 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}

function DailyStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl bg-ink-50 ring-1 ring-ink-100 px-3 py-2">
      <div className="text-[10px] font-bold tracking-wide uppercase text-ink-400">
        {label}
      </div>
      <div className={`text-[14px] font-bold leading-tight mt-0.5 ${tone || "text-ink-900"}`}>
        {value}
      </div>
      <div className="text-[10.5px] text-ink-500">{sub}</div>
    </div>
  );
}

function DailyChart({ points }: { points: number[] }) {
  const max = Math.max(...points);
  return (
    <div className="rounded-2xl ring-1 ring-ink-100 p-4 bg-white">
      <div className="flex items-end gap-[3px] h-28">
        {points.map((v, i) => {
          const h = (v / max) * 100;
          const isWeekend = i % 7 === 5 || i % 7 === 6;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all"
              style={{
                height: `${h}%`,
                background: isWeekend
                  ? "linear-gradient(180deg, #FFB78F, #FF7A4A)"
                  : "linear-gradient(180deg, #FF7A4A, #FF5A1F)",
                opacity: i >= points.length - 2 ? 0.55 : 1,
              }}
              title={`Dan ${i + 1}: ${v} prijava`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-ink-400 mt-2 font-semibold tracking-wide">
        <span>1. apr</span>
        <span>15. apr</span>
        <span>30. apr</span>
      </div>
    </div>
  );
}

function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-full max-w-[160px] mx-auto mt-3">
      {segments.map((seg, i) => {
        const frac = seg.value / total;
        const len = circ * frac;
        const node = (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${len} ${circ}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
          />
        );
        offset += len;
        return node;
      })}
      <text
        x="50"
        y="48"
        textAnchor="middle"
        className="fill-ink-400"
        fontSize="6"
        fontWeight="700"
        letterSpacing="1"
      >
        UKUPNO
      </text>
      <text
        x="50"
        y="58"
        textAnchor="middle"
        className="fill-ink-900"
        fontSize="11"
        fontWeight="700"
      >
        {total.toLocaleString("sr-RS")} €
      </text>
    </svg>
  );
}

function ResourceBox({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: [string, string][];
}) {
  return (
    <div className="rounded-2xl ring-1 ring-ink-100 p-4 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-7 w-7 rounded-lg bg-ink-50 ring-1 ring-ink-100 text-ink-600 grid place-items-center">
          {icon}
        </span>
        <div className="text-[13px] font-bold text-ink-900">{title}</div>
      </div>
      <div className="space-y-1.5">
        {lines.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-[11.5px]">
            <span className="text-ink-500">{k}</span>
            <span className="font-bold text-ink-900 tabular-nums">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Recommendation({
  severity,
  children,
}: {
  severity: "high" | "medium" | "low";
  children: React.ReactNode;
}) {
  const conf = {
    high: {
      bg: "bg-signal-red/10 ring-signal-red/20",
      dot: "#E5484D",
      label: "VISOK PRIORITET",
    },
    medium: {
      bg: "bg-signal-amber/10 ring-signal-amber/20",
      dot: "#F5A524",
      label: "SREDNJI",
    },
    low: { bg: "bg-ink-50 ring-ink-100", dot: "#9B9FAD", label: "NIZAK" },
  }[severity];
  return (
    <li className={`flex items-start gap-3 rounded-xl ring-1 px-3.5 py-2.5 ${conf.bg}`}>
      <span className="mt-1 h-2 w-2 rounded-full shrink-0" style={{ background: conf.dot }} />
      <div className="flex-1">
        <span
          className="inline-block text-[9.5px] font-bold tracking-[0.16em] uppercase mr-2"
          style={{ color: conf.dot }}
        >
          {conf.label}
        </span>
        {children}
      </div>
    </li>
  );
}

function SignatureBlock({
  title,
  name,
  role,
}: {
  title: string;
  name: string;
  role: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-ink-400">
        {title}
      </div>
      <div className="mt-7 border-t border-ink-300 pt-1.5">
        <div className="text-[12.5px] font-bold text-ink-900">{name}</div>
        <div className="text-[10.5px] text-ink-500">{role}</div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="h-2 w-2 rounded-full ring-2 ring-white"
        style={{ background: color }}
      />
      <span className="font-semibold">{label}</span>
    </span>
  );
}

// MapPin import retained for future variants
void MapPin;
