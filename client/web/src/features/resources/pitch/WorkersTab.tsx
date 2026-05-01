import { useMemo, useState } from "react";
import {
  CalendarDays,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { MapCanvas, type MapVehicleMarker } from "@/features/map/citizen/MapCanvas";
import { CITY_CENTER } from "@/features/map/citizen/data";
import type { UserLocation } from "@/features/map/citizen/types";
import {
  ROLE_LABEL,
  SHIFT_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  WORKERS,
} from "./mockData";
import type { Worker } from "./types";

interface Props {
  query: string;
}

export function WorkersTab({ query }: Props) {
  const [selectedId, setSelectedId] = useState<string>(WORKERS[0].id);

  const filtered = useMemo(() => {
    if (!query) return WORKERS;
    const q = query.toLowerCase();
    return WORKERS.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        ROLE_LABEL[w.role].toLowerCase().includes(q) ||
        w.crewName?.toLowerCase().includes(q) ||
        w.phone.toLowerCase().includes(q)
    );
  }, [query]);

  // Group field workers by crew for the map
  const crewMarkers: MapVehicleMarker[] = useMemo(() => {
    const crewMap = new Map<
      string,
      { lng: number; lat: number; members: number; ids: string[] }
    >();
    WORKERS.forEach((w) => {
      if (!w.crewName || w.lng == null || w.lat == null) return;
      const cur = crewMap.get(w.crewName);
      if (cur) {
        cur.members += 1;
        cur.ids.push(w.id);
      } else {
        crewMap.set(w.crewName, { lng: w.lng, lat: w.lat, members: 1, ids: [w.id] });
      }
    });
    return Array.from(crewMap.entries()).map(([name, data]) => ({
      id: name,
      lng: data.lng,
      lat: data.lat,
      heading: 0,
      color: "#FF5A1F",
      label: `${name} · ${data.members}`,
      pulsing: data.ids.includes(selectedId),
      selected: data.ids.includes(selectedId),
    }));
  }, [selectedId]);

  const userLocation: UserLocation = {
    lng: CITY_CENTER[0],
    lat: CITY_CENTER[1],
  };

  const totals = useMemo(() => {
    const active = WORKERS.filter((w) => w.status === "active" || w.status === "field");
    const onField = WORKERS.filter((w) => w.status === "field").length;
    const onLeave = WORKERS.filter(
      (w) => w.status === "on_leave" || w.status === "sick"
    ).length;
    const certs = WORKERS.reduce((s, w) => s + w.certifications.length, 0);
    return { active: active.length, onField, onLeave, certs };
  }, []);

  const selected = WORKERS.find((w) => w.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-12 gap-5 h-[calc(100dvh-160px)]">
      <div className="col-span-7 flex flex-col gap-4 min-h-0">
        <div className="grid grid-cols-4 gap-3">
          <Kpi icon={<Users size={13} />} label="Aktivnih" value={`${totals.active}/${WORKERS.length}`} />
          <Kpi icon={<UserPlus size={13} />} label="Na terenu sada" value={`${totals.onField}`} tone="text-[#0F7AB3]" />
          <Kpi
            icon={<CalendarDays size={13} />}
            label="Odmor / bolovanje"
            value={`${totals.onLeave}`}
            tone={totals.onLeave > 2 ? "text-signal-amber" : "text-ink-700"}
          />
          <Kpi icon={<ShieldCheck size={13} />} label="Aktivnih sertifikata" value={`${totals.certs}`} />
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-2 auto-rows-min gap-3 overflow-y-auto nice-scroll pr-1 content-start">
          {filtered.map((w) => (
            <WorkerCard
              key={w.id}
              worker={w}
              active={w.id === selectedId}
              onClick={() => setSelectedId(w.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 px-4 py-10 text-center text-[12.5px] text-ink-400">
              Nema radnika po ovim filterima.
            </div>
          )}
        </div>
      </div>

      <aside className="col-span-5 flex flex-col gap-4 min-h-0">
        <div className="rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-brand-500/10 text-brand-500 grid place-items-center">
                <Users size={13} />
              </span>
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.14em] text-brand-500 uppercase">
                  Ekipe na terenu
                </div>
                <div className="text-[13px] font-bold text-ink-900 leading-tight">
                  {crewMarkers.length} aktivnih lokacija
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-[300px]">
            <MapCanvas
              hazards={[]}
              userLocation={userLocation}
              pendingLocation={null}
              vehicles={crewMarkers}
            />
          </div>
        </div>

        {selected && <WorkerDetail worker={selected} />}
      </aside>
    </div>
  );
}

function WorkerCard({
  worker,
  active,
  onClick,
}: {
  worker: Worker;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group text-left rounded-2xl bg-white p-3.5 transition-all ring-1
        ${
          active
            ? "ring-brand-500 shadow-lift"
            : "ring-ink-100 hover:ring-ink-200 hover:shadow-soft"
        }`}
    >
      <div className="flex items-start gap-3">
        <span className="h-11 w-11 rounded-2xl bg-ink-700 text-white grid place-items-center text-[14px] font-bold shrink-0">
          {worker.initials}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-ink-900 truncate">
                {worker.name}
              </div>
              <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase mt-0.5">
                {ROLE_LABEL[worker.role]}
              </div>
            </div>
            <span
              className={`text-[10px] font-bold tracking-wide uppercase rounded-full px-2 py-0.5 shrink-0 ${STATUS_TONE[worker.status]}`}
            >
              {STATUS_LABEL[worker.status]}
            </span>
          </div>
          <div className="text-[11.5px] text-ink-500 truncate mt-1.5">
            {worker.crewName} · {SHIFT_LABEL[worker.shift]}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10.5px] text-ink-400">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={10} /> {worker.experienceYears} g. staža
            </span>
            <span className="text-ink-200">·</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck size={10} /> {worker.certifications.length} sertifikata
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function WorkerDetail({ worker }: { worker: Worker }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 border-b border-ink-100 flex items-start gap-3">
        <span className="h-12 w-12 rounded-2xl bg-ink-700 text-white grid place-items-center text-[15px] font-bold shrink-0">
          {worker.initials}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] font-bold tracking-[0.14em] text-brand-500 uppercase">
            {ROLE_LABEL[worker.role]}
          </div>
          <div className="text-[16px] font-bold text-ink-900 leading-tight">
            {worker.name}
          </div>
          <div className="text-[11.5px] text-ink-500 mt-0.5">
            {worker.crewName} · {SHIFT_LABEL[worker.shift]} smena
          </div>
        </div>
        <span
          className={`text-[10px] font-bold tracking-wide uppercase rounded-full px-2 py-0.5 shrink-0 ${STATUS_TONE[worker.status]}`}
        >
          {STATUS_LABEL[worker.status]}
        </span>
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b border-ink-100">
        <DetailLabel label="Staž">
          <div className="text-[12.5px] font-semibold text-ink-900">
            {worker.experienceYears} godina · od {worker.hiredOn}
          </div>
        </DetailLabel>
        <DetailLabel label="Smena">
          <div className="text-[12.5px] font-semibold text-ink-900">
            {SHIFT_LABEL[worker.shift]}
          </div>
        </DetailLabel>
      </div>

      <div className="px-4 py-3 border-b border-ink-100">
        <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-2">
          Kontakt
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`tel:${worker.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 text-[12px] font-semibold hover:bg-ink-100"
          >
            <Phone size={12} /> {worker.phone}
          </a>
          <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 text-[12px] font-semibold hover:bg-ink-100">
            <Mail size={12} /> Pošalji poruku
          </button>
        </div>
      </div>

      <div className="px-4 py-3 flex-1 overflow-y-auto nice-scroll">
        <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-2">
          Sertifikati i obuke
        </div>
        {worker.certifications.length === 0 ? (
          <div className="text-[12px] text-ink-400">Nema upisanih sertifikata.</div>
        ) : (
          <div className="space-y-2">
            {worker.certifications.map((c) => (
              <div
                key={c.code}
                className="flex items-center gap-2.5 rounded-xl bg-ink-50 ring-1 ring-ink-100 p-2.5"
              >
                <span className="h-8 w-8 rounded-lg bg-signal-green/15 text-signal-green grid place-items-center shrink-0">
                  <GraduationCap size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-ink-900 truncate">
                    {c.label}
                  </div>
                  <div className="text-[10.5px] text-ink-400">
                    Šifra <span className="font-mono font-semibold">{c.code}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[9.5px] font-bold tracking-wide uppercase text-ink-400">
                    Važi do
                  </div>
                  <div className="text-[12px] font-semibold text-ink-900">
                    {c.validUntil}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink-100 px-3.5 py-2.5">
      <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-ink-400 inline-flex items-center gap-1">
        {icon} {label}
      </div>
      <div className={`text-[18px] font-bold leading-tight mt-0.5 ${tone || "text-ink-900"}`}>
        {value}
      </div>
    </div>
  );
}

function DetailLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9.5px] font-bold tracking-wide uppercase text-ink-400 mb-0.5">
        {label}
      </div>
      {children}
    </div>
  );
}
