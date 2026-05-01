import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Coins,
  FileSpreadsheet,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { MapCanvas } from "@/features/map/citizen/MapCanvas";
import { CITY_CENTER, WORK_SEGMENTS } from "@/features/map/citizen/data";
import { AGENCY_INCIDENTS, CREWS } from "@/features/incidents/pitch/mockData";
import { WORK_ORDERS } from "@/features/workOrders/pitch/mockData";
import type { Hazard, UserLocation } from "@/features/map/citizen/types";
import { INCIDENT_TYPES } from "@/features/map/citizen/data";
import { Icons } from "@/features/map/citizen/icons";
import { PriorityChip } from "@/features/incidents/pitch/PriorityChip";

export function ManagerDashboardPage() {
  const newCount = AGENCY_INCIDENTS.filter((i) => i.status === "new").length;
  const inProgress = WORK_ORDERS.filter((o) => o.status === "in_progress").length;
  const completedToday = WORK_ORDERS.filter((o) => o.status === "completed").length;
  const availableCrews = CREWS.filter((c) => c.available).length;

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

  return (
    <div
      className="citizen-root min-h-[100dvh] w-full bg-ink-50 flex flex-col"
      style={{ fontFamily: "Inter Tight, system-ui, sans-serif" }}
    >
      <header className="shrink-0 bg-white border-b border-ink-100 px-8 py-4 flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-brand-500 text-white grid place-items-center shadow-fab">
            <LayoutDashboard size={18} />
          </span>
          <div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500 uppercase">
              Putevi NP · Manager
            </div>
            <div className="text-[16px] font-bold text-ink-900 leading-tight">
              Pregled za danas, 1. maj 2026
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 ml-6">
          <NavLink to="/pitch/dashboard" active>
            <LayoutDashboard size={14} /> Pregled
          </NavLink>
          <NavLink to="/pitch/incidents">
            <Inbox size={14} /> Prijave
          </NavLink>
          <NavLink to="/pitch/workorders">
            <ClipboardList size={14} /> Nalozi
          </NavLink>
          <NavLink to="/pitch/fleet">
            <Truck size={14} /> Flota
          </NavLink>
          <NavLink to="/pitch/news">
            <Newspaper size={14} /> Vesti
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button className="relative h-9 w-9 rounded-full grid place-items-center bg-ink-50 hover:bg-ink-100 text-ink-600">
            <Bell size={16} />
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-signal-red text-white text-[9px] font-bold grid place-items-center ring-2 ring-white">
              4
            </span>
          </button>
          <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-ink-100">
            <span className="h-9 w-9 rounded-full bg-ink-700 text-white grid place-items-center text-[13px] font-bold">
              AP
            </span>
            <div>
              <div className="text-[12.5px] font-bold text-ink-900 leading-tight">
                Aleksandar P.
              </div>
              <div className="text-[10.5px] text-ink-400">Dispečer · uprava</div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-6 grid grid-cols-12 gap-5">
        <section className="col-span-12 grid grid-cols-4 gap-4">
          <KpiCard
            icon={<Inbox size={16} />}
            tone="brand"
            label="Nove prijave"
            value={`${newCount}`}
            sub="od jutros"
            trend="+3"
            up
          />
          <KpiCard
            icon={<Wrench size={16} />}
            tone="ice"
            label="Aktivni radovi"
            value={`${inProgress}`}
            sub={`${availableCrews}/${CREWS.length} ekipa slobodno`}
            trend="−1 vs juče"
            up={false}
          />
          <KpiCard
            icon={<Clock size={16} />}
            tone="amber"
            label="Prosečno vreme odziva"
            value="42 min"
            sub="poslednjih 7 dana"
            trend="−18%"
            up={false}
          />
          <KpiCard
            icon={<Coins size={16} />}
            tone="green"
            label="Trošak ovog meseca"
            value="14.380 €"
            sub="budžet 22.000 €"
            trend="65% iskorišćeno"
            up
          />
        </section>

        <section className="col-span-8 grid grid-rows-[auto_1fr] gap-5">
          <div className="rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-lg bg-brand-500/10 text-brand-500 grid place-items-center">
                  <AlertTriangle size={14} />
                </span>
                <div>
                  <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500 uppercase">
                    Mapa regiona
                  </div>
                  <div className="text-[14px] font-bold text-ink-900">
                    Live prikaz prijava i radova
                  </div>
                </div>
              </div>
              <Link
                to="/pitch/incidents"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-700 hover:text-brand-500"
              >
                Otvori inbox <ArrowRight size={13} />
              </Link>
            </div>
            <div className="relative h-[420px]">
              <MapCanvas
                hazards={hazards}
                workSegments={WORK_SEGMENTS}
                userLocation={userLocation}
                pendingLocation={null}
              />
              <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-start justify-between gap-3">
                <div className="pointer-events-auto bg-white/92 backdrop-blur-xl rounded-xl ring-1 ring-black/5 shadow-soft px-2.5 py-1.5 text-[11px] text-ink-600 flex items-center gap-3">
                  <LegendDot color="#E5484D" label="Hitno" />
                  <LegendDot color="#FF5A1F" label="Visok" />
                  <LegendDot color="#9B9FAD" label="Normalan" />
                </div>
                <div className="pointer-events-auto bg-white/92 backdrop-blur-xl rounded-xl ring-1 ring-black/5 shadow-soft px-2.5 py-1.5 text-[11px] text-ink-600">
                  <span className="font-bold tracking-wide text-[10px] text-brand-500 uppercase">
                    Region
                  </span>{" "}
                  <span className="text-ink-900 font-bold">Novi Pazar</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card title="Trend prijava · 7 dana" icon={<TrendingUp size={14} />}>
              <Sparkline />
              <div className="grid grid-cols-3 mt-3 gap-3 text-[11.5px] text-ink-500">
                <div>
                  <div className="text-[10px] font-bold tracking-wide text-ink-400 uppercase">
                    Pn–Ned
                  </div>
                  <div className="text-[15px] font-bold text-ink-900">187 prijava</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-wide text-ink-400 uppercase">
                    Vrh
                  </div>
                  <div className="text-[15px] font-bold text-ink-900">42 čet.</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-wide text-ink-400 uppercase">
                    Promena
                  </div>
                  <div className="text-[15px] font-bold text-signal-green inline-flex items-center gap-1">
                    +12% <TrendingUp size={12} />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Učinak ekipa" icon={<Users size={14} />}>
              <div className="space-y-2.5">
                <CrewBar name="Asfalterska ekipa A" done={12} max={14} />
                <CrewBar name="Asfalterska ekipa B" done={9} max={12} />
                <CrewBar name="Hitna intervencija" done={8} max={9} />
                <CrewBar name="Signalizacija" done={6} max={7} />
                <CrewBar name="Zimska služba 1" done={4} max={6} />
              </div>
            </Card>
          </div>
        </section>

        <aside className="col-span-4 space-y-5">
          <Card
            title="Aktivnost u realnom vremenu"
            icon={<Megaphone size={14} />}
            action={
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-signal-green">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-green animate-pulse" />
                Live
              </span>
            }
          >
            <div className="space-y-2.5 -mx-1">
              <ActivityItem
                icon="report"
                badge="brand"
                title="Nova prijava · Stevana Nemanje 12"
                meta="Marko Jovanović · pre 12 min"
                accent="HITNO"
              />
              <ActivityItem
                icon="check"
                badge="green"
                title="Završen WO-1037 · Obilaznica Tutin"
                meta="Ekipa za održavanje · pre 38 min"
              />
              <ActivityItem
                icon="report"
                badge="brand"
                title="Nova prijava · Postenje, autobuska 5"
                meta="Marija Todorović · pre 3 min"
                accent="VISOK"
              />
              <ActivityItem
                icon="assign"
                badge="ice"
                title="Zimska služba 1 dodeljena WO-1042"
                meta="Most preko Raške · pre 28 min"
              />
              <ActivityItem
                icon="news"
                badge="amber"
                title="Objavljeno upozorenje · poledica"
                meta="Aleksandar P. · pre 1 sat"
              />
              <ActivityItem
                icon="check"
                badge="green"
                title="Završen WO-1036 · 13. jula"
                meta="Asfalterska ekipa B · juče 13:24"
              />
            </div>
          </Card>

          <Card title="Prioritetne prijave" icon={<AlertTriangle size={14} />}>
            <div className="space-y-2">
              {AGENCY_INCIDENTS.slice(0, 3).map((i) => {
                const meta =
                  INCIDENT_TYPES.find((t) => t.id === i.type) ?? INCIDENT_TYPES[0];
                const Icon = Icons[meta.icon] ?? AlertTriangle;
                return (
                  <Link
                    key={i.id}
                    to="/pitch/incidents"
                    className="flex items-start gap-2.5 rounded-xl ring-1 ring-ink-100 bg-white p-2.5 hover:ring-ink-200 transition"
                  >
                    <span
                      className="h-9 w-9 rounded-xl grid place-items-center text-white shrink-0"
                      style={{ background: meta.color }}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-bold text-ink-900 truncate">
                        {i.address}
                      </div>
                      <div className="text-[11px] text-ink-400 truncate">
                        {i.note}
                      </div>
                    </div>
                    <PriorityChip priority={i.priority} />
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card title="Predstojeći radovi" icon={<ClipboardCheck size={14} />}>
            <div className="space-y-2">
              {WORK_ORDERS.filter((o) => o.status === "created")
                .slice(0, 3)
                .map((o) => (
                  <Link
                    key={o.id}
                    to="/pitch/workorders"
                    className="flex items-center gap-3 rounded-xl ring-1 ring-ink-100 bg-white p-2.5 hover:ring-ink-200 transition"
                  >
                    <span className="h-9 w-9 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 grid place-items-center shrink-0">
                      <FileSpreadsheet size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-bold text-ink-900 truncate">
                        {o.title}
                      </div>
                      <div className="text-[11px] text-ink-400 truncate">
                        {o.scheduledFor} · {o.crew.name}
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-ink-400" />
                  </Link>
                ))}
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function NavLink({
  children,
  to,
  active,
}: {
  children: React.ReactNode;
  to: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-[12.5px] font-semibold transition
        ${
          active
            ? "bg-ink-900 text-white"
            : "text-ink-600 hover:bg-ink-50"
        }`}
    >
      {children}
    </Link>
  );
}

function KpiCard({
  icon,
  tone,
  label,
  value,
  sub,
  trend,
  up,
}: {
  icon: React.ReactNode;
  tone: "brand" | "ice" | "amber" | "green";
  label: string;
  value: string;
  sub: string;
  trend?: string;
  up?: boolean;
}) {
  const TONE: Record<string, string> = {
    brand: "bg-brand-500/10 text-brand-500",
    ice: "bg-signal-ice/15 text-[#0F7AB3]",
    amber: "bg-signal-amber/15 text-signal-amber",
    green: "bg-signal-green/15 text-signal-green",
  };
  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink-100 p-4 shadow-soft/50">
      <div className="flex items-center justify-between">
        <span
          className={`h-9 w-9 rounded-xl grid place-items-center ${TONE[tone]}`}
        >
          {icon}
        </span>
        {trend ? (
          <span
            className={`inline-flex items-center gap-1 text-[10.5px] font-bold rounded-full px-2 py-0.5
              ${up ? "bg-signal-green/10 text-signal-green" : "bg-signal-red/10 text-signal-red"}`}
          >
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </span>
        ) : null}
      </div>
      <div className="text-[10.5px] font-bold tracking-[0.14em] text-ink-400 uppercase mt-3">
        {label}
      </div>
      <div className="text-[26px] font-bold text-ink-900 leading-tight mt-0.5">
        {value}
      </div>
      <div className="text-[11.5px] text-ink-500 mt-0.5">{sub}</div>
    </div>
  );
}

function Card({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="h-7 w-7 rounded-lg bg-ink-50 ring-1 ring-ink-100 text-ink-600 grid place-items-center">
              {icon}
            </span>
          )}
          <div className="text-[13px] font-bold text-ink-900">{title}</div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full ring-2 ring-white"
        style={{ background: color }}
      />
      <span className="font-semibold">{label}</span>
    </span>
  );
}

function CrewBar({ name, done, max }: { name: string; done: number; max: number }) {
  const pct = Math.round((done / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[11.5px]">
        <span className="font-semibold text-ink-700 truncate">{name}</span>
        <span className="text-ink-500 tabular-nums">
          {done}/{max} naloga
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-ink-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Sparkline() {
  const points = [22, 26, 19, 30, 42, 28, 20];
  const max = Math.max(...points);
  const w = 280;
  const h = 64;
  const stepX = w / (points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * stepX;
      const y = h - (v / max) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const area =
    path +
    ` L ${(points.length - 1) * stepX} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-grad)" />
      <path d={path} fill="none" stroke="#FF5A1F" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((v, i) => (
        <circle
          key={i}
          cx={i * stepX}
          cy={h - (v / max) * (h - 8) - 4}
          r={i === points.length - 1 ? 3 : 2}
          fill="white"
          stroke="#FF5A1F"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

function ActivityItem({
  icon,
  badge,
  title,
  meta,
  accent,
}: {
  icon: "report" | "check" | "assign" | "news";
  badge: "brand" | "green" | "ice" | "amber";
  title: string;
  meta: string;
  accent?: string;
}) {
  const BADGE: Record<string, string> = {
    brand: "bg-brand-500/10 text-brand-500",
    green: "bg-signal-green/15 text-signal-green",
    ice: "bg-signal-ice/15 text-[#0F7AB3]",
    amber: "bg-signal-amber/15 text-signal-amber",
  };
  const ICONS = {
    report: AlertTriangle,
    check: CheckCircle2,
    assign: Truck,
    news: Megaphone,
  } as const;
  const Icon = ICONS[icon];
  return (
    <div className="flex items-start gap-2.5 px-1">
      <span
        className={`h-8 w-8 rounded-xl grid place-items-center shrink-0 ${BADGE[badge]}`}
      >
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-semibold text-ink-900 leading-tight">
          {title}
        </div>
        <div className="text-[10.5px] text-ink-400 mt-0.5">{meta}</div>
      </div>
      {accent && (
        <span className="text-[9.5px] font-bold tracking-wide bg-brand-500/10 text-brand-500 rounded-full px-1.5 py-0.5">
          {accent}
        </span>
      )}
    </div>
  );
}
