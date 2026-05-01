import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Battery,
  Clock,
  Fuel,
  Gauge,
  Map as MapIcon,
  MapPin,
  Phone,
  Radio,
  Search,
  Truck,
  X,
} from "lucide-react";
import { MapCanvas, type MapVehicleMarker } from "@/features/map/citizen/MapCanvas";
import { CITY_CENTER, INCIDENT_TYPES, WORK_SEGMENTS } from "@/features/map/citizen/data";
import { Icons } from "@/features/map/citizen/icons";
import type { Hazard, UserLocation } from "@/features/map/citizen/types";
import { flyTo } from "@/features/map/citizen/mapBridge";
import { AGENCY_INCIDENTS } from "@/features/incidents/pitch/mockData";
import { FLEET, STATUS_COLOR, STATUS_LABEL, VEHICLE_KIND_LABEL } from "./mockData";
import type { FleetVehicle, VehicleStatus } from "./types";

const STATUS_FILTERS: (VehicleStatus | "all")[] = [
  "all",
  "on_site",
  "en_route",
  "idle",
  "returning",
  "off_duty",
];
const STATUS_TAB_LABEL: Record<VehicleStatus | "all", string> = {
  all: "Sva",
  ...STATUS_LABEL,
};

export function FleetMapPage() {
  const [filter, setFilter] = useState<VehicleStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(FLEET[0].id);
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: FLEET.length };
    FLEET.forEach((v) => (c[v.status] = (c[v.status] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    return FLEET.filter((v) => {
      if (filter !== "all" && v.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          v.callSign.toLowerCase().includes(q) ||
          v.plate.toLowerCase().includes(q) ||
          v.crewName.toLowerCase().includes(q) ||
          v.driver.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filter, query]);

  const hazards: Hazard[] = useMemo(
    () =>
      AGENCY_INCIDENTS.filter((i) =>
        ["new", "triaged", "in_progress"].includes(i.status)
      ).map((i) => ({
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

  const vehicles: MapVehicleMarker[] = useMemo(
    () =>
      filtered.map((v) => ({
        id: v.id,
        lng: v.lng,
        lat: v.lat,
        heading: v.heading,
        color: STATUS_COLOR[v.status],
        label: v.callSign,
        pulsing: v.status === "en_route",
        selected: v.id === selectedId,
      })),
    [filtered, selectedId]
  );

  const userLocation: UserLocation = {
    lng: CITY_CENTER[0],
    lat: CITY_CENTER[1],
  };

  const selected = selectedId ? FLEET.find((v) => v.id === selectedId) ?? null : null;

  const onSelect = (id: string) => {
    setSelectedId(id);
    const v = FLEET.find((x) => x.id === id);
    if (v) flyTo(v.lng, v.lat, 15.6);
  };

  return (
    <div
      className="citizen-root fixed inset-0 h-[100dvh] w-full overflow-hidden bg-ink-50 flex"
      style={{ fontFamily: "Inter Tight, system-ui, sans-serif" }}
    >
      <aside className="flex flex-col h-full w-full lg:w-[420px] shrink-0 border-r border-ink-100 bg-ink-50">
        <div className="px-5 pt-5 pb-3 bg-white border-b border-ink-100">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="h-9 w-9 rounded-xl bg-ink-900 text-white grid place-items-center">
              <Truck size={18} />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500 uppercase">
                Operativa · Flota
              </div>
              <div className="text-[16px] font-bold text-ink-900 leading-tight">
                Vozila i ekipe uživo
              </div>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-signal-green">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-green animate-pulse" />
              Live
            </span>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pretraži po pozivnom znaku, registraciji…"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-[13px] text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white"
            />
          </div>
        </div>

        <div className="px-5 pt-3 pb-2 bg-white border-b border-ink-100">
          <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1 nice-scroll">
            {STATUS_FILTERS.map((s) => {
              const active = s === filter;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold transition
                    ${
                      active
                        ? "bg-ink-900 text-white"
                        : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                    }`}
                >
                  {s !== "all" && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: STATUS_COLOR[s as VehicleStatus] }}
                    />
                  )}
                  {STATUS_TAB_LABEL[s]}
                  <span
                    className={`text-[10.5px] px-1.5 rounded-full ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white text-ink-500 ring-1 ring-ink-100"
                    }`}
                  >
                    {counts[s] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto nice-scroll p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center text-ink-400 text-[13px] py-12">
              Nema vozila po ovim filterima.
            </div>
          ) : (
            filtered.map((v) => (
              <VehicleRow
                key={v.id}
                vehicle={v}
                selected={selectedId === v.id}
                onClick={() => onSelect(v.id)}
              />
            ))
          )}
        </div>
      </aside>

      <div className="relative flex-1 hidden lg:block">
        <MapCanvas
          hazards={hazards}
          workSegments={WORK_SEGMENTS}
          userLocation={userLocation}
          pendingLocation={null}
          vehicles={vehicles}
          onVehicleClick={onSelect}
        />

        <div className="pointer-events-none absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
          <div className="pointer-events-auto bg-white/92 backdrop-blur-xl rounded-2xl ring-1 ring-black/5 shadow-soft px-3 py-2 text-[12px] text-ink-700">
            <div className="font-bold tracking-wider text-[10.5px] text-brand-500 uppercase">
              Region · Novi Pazar
            </div>
            <div className="text-[13px] font-bold text-ink-900 leading-tight">
              {filtered.length} vozila · {hazards.length} aktivnih prijava
            </div>
          </div>
          <div className="pointer-events-auto bg-white/92 backdrop-blur-xl rounded-full ring-1 ring-black/5 shadow-soft px-3 py-1.5 flex items-center gap-3 text-[11px] text-ink-600">
            <LegendDot color={STATUS_COLOR.idle} label="Slobodno" />
            <LegendDot color={STATUS_COLOR.en_route} label="Na putu" />
            <LegendDot color={STATUS_COLOR.on_site} label="Na terenu" />
            <LegendDot color={STATUS_COLOR.returning} label="Povratak" />
          </div>
        </div>

        {selected && (
          <VehicleDetail
            key={selected.id}
            vehicle={selected}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}

function VehicleRow({
  vehicle,
  selected,
  onClick,
}: {
  vehicle: FleetVehicle;
  selected: boolean;
  onClick: () => void;
}) {
  const color = STATUS_COLOR[vehicle.status];
  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left rounded-2xl bg-white p-3 transition-all
        ring-1 ${
          selected
            ? "ring-brand-500 shadow-lift"
            : "ring-ink-100 hover:ring-ink-200 hover:shadow-soft"
        }`}
    >
      {selected && (
        <span className="absolute -left-[1px] top-3 bottom-3 w-[3px] rounded-r bg-brand-500" />
      )}
      <div className="flex items-center gap-3">
        <span
          className="h-10 w-10 rounded-2xl grid place-items-center text-white shrink-0"
          style={{ background: color }}
        >
          <Truck size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[13.5px] font-bold text-ink-900 truncate">
              {vehicle.callSign}
            </div>
            <span
              className="text-[10.5px] font-bold tracking-wide uppercase rounded-full px-2 py-0.5"
              style={{ background: `${color}1a`, color }}
            >
              {STATUS_LABEL[vehicle.status]}
            </span>
          </div>
          <div className="text-[11.5px] text-ink-500 truncate">
            {vehicle.crewName} · {vehicle.driver}
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-ink-400">
            <span className="inline-flex items-center gap-1 font-mono">
              {vehicle.plate}
            </span>
            <span className="text-ink-200">·</span>
            <span className="inline-flex items-center gap-1">
              <Gauge size={10} /> {vehicle.speedKmh} km/h
            </span>
            <span className="text-ink-200">·</span>
            <span className="inline-flex items-center gap-1">
              <Fuel size={10} /> {vehicle.fuelPct}%
            </span>
          </div>
          {vehicle.destination && (
            <div className="mt-1.5 text-[11px] text-ink-700 inline-flex items-center gap-1.5 bg-ink-50 ring-1 ring-ink-100 rounded-full px-2 py-0.5 max-w-full">
              <MapPin size={10} className="shrink-0" />
              <span className="truncate">{vehicle.destination}</span>
              {vehicle.etaMins != null && vehicle.etaMins > 0 ? (
                <span className="font-bold text-brand-500 ml-1">
                  {vehicle.etaMins}'
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function VehicleDetail({
  vehicle,
  onClose,
}: {
  vehicle: FleetVehicle;
  onClose: () => void;
}) {
  const color = STATUS_COLOR[vehicle.status];
  const linkedIncident = vehicle.workOrderId
    ? AGENCY_INCIDENTS.find((i) => i.workOrderId === vehicle.workOrderId)
    : null;
  const incMeta = linkedIncident
    ? INCIDENT_TYPES.find((t) => t.id === linkedIncident.type) ?? INCIDENT_TYPES[0]
    : null;
  const IncIcon = incMeta ? Icons[incMeta.icon] ?? AlertTriangle : null;

  return (
    <div
      className="absolute right-0 top-0 bottom-0 z-30 w-full max-w-[420px] bg-white shadow-lift border-l border-ink-100 flex flex-col"
      style={{
        fontFamily: "Inter Tight, system-ui, sans-serif",
        animation: "slideLeft 240ms cubic-bezier(.2,.8,.2,1) both",
      }}
    >
      <div className="relative shrink-0 px-5 pt-5 pb-4 border-b border-ink-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-9 w-9 rounded-full grid place-items-center bg-ink-50 hover:bg-ink-100 text-ink-500"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-3">
          <span
            className="h-12 w-12 rounded-2xl grid place-items-center text-white shrink-0"
            style={{ background: color }}
          >
            <Truck size={22} />
          </span>
          <div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-brand-500 uppercase">
              {VEHICLE_KIND_LABEL[vehicle.kind]}
            </div>
            <div className="text-[20px] font-bold text-ink-900 leading-tight">
              {vehicle.callSign}
            </div>
            <div className="text-[12px] text-ink-500 mt-0.5 font-mono">
              {vehicle.plate}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase rounded-full px-2.5 py-1"
            style={{ background: `${color}1a`, color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {STATUS_LABEL[vehicle.status]}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
            <Clock size={11} /> {vehicle.lastPing}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto nice-scroll px-5 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<Gauge size={13} />} label="Brzina" value={`${vehicle.speedKmh}`} unit="km/h" />
          <Stat icon={<Fuel size={13} />} label="Gorivo" value={`${vehicle.fuelPct}`} unit="%" warn={vehicle.fuelPct < 35} />
          <Stat icon={<Battery size={13} />} label="Smer" value={`${Math.round(vehicle.heading)}°`} unit="" />
        </div>

        <div className="rounded-2xl bg-ink-50 ring-1 ring-ink-100 p-3">
          <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-2">
            Vozač
          </div>
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full bg-ink-700 text-white grid place-items-center text-[13px] font-bold">
              {vehicle.driver
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-bold text-ink-900 truncate">
                {vehicle.driver}
              </div>
              <div className="text-[11.5px] text-ink-500 truncate">
                {vehicle.crewName}
              </div>
            </div>
            <button className="h-9 w-9 rounded-full grid place-items-center bg-white ring-1 ring-ink-200 text-ink-600 hover:bg-ink-50">
              <Phone size={14} />
            </button>
            <button className="h-9 w-9 rounded-full grid place-items-center bg-white ring-1 ring-ink-200 text-ink-600 hover:bg-ink-50">
              <Radio size={14} />
            </button>
          </div>
        </div>

        {vehicle.destination && (
          <div className="rounded-2xl bg-ink-50 ring-1 ring-ink-100 p-3">
            <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-2">
              Trenutni zadatak
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold text-ink-900 truncate">
                  {vehicle.destination}
                </div>
                <div className="text-[11.5px] text-ink-500">
                  {vehicle.workOrderId ? `Nalog ${vehicle.workOrderId}` : "Bez naloga"}
                </div>
              </div>
              {vehicle.etaMins != null && vehicle.etaMins > 0 ? (
                <div className="text-right">
                  <div className="text-[10.5px] text-ink-400 font-bold tracking-wide uppercase">
                    ETA
                  </div>
                  <div className="text-[15px] font-bold text-brand-500">
                    {vehicle.etaMins} min
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {linkedIncident && incMeta && IncIcon && (
          <div>
            <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-ink-400 mb-2 px-0.5">
              Povezana prijava
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white ring-1 ring-ink-100 p-3">
              <span
                className="h-10 w-10 rounded-xl grid place-items-center text-white shrink-0"
                style={{ background: incMeta.color }}
              >
                <IncIcon size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-ink-900 truncate">
                  {linkedIncident.address}
                </div>
                <div className="text-[11.5px] text-ink-500 line-clamp-2">
                  {linkedIncident.note}
                </div>
              </div>
              <ArrowRight size={14} className="text-ink-400 shrink-0 mt-1" />
            </div>
          </div>
        )}

        <button className="w-full h-11 rounded-2xl bg-ink-50 hover:bg-ink-100 ring-1 ring-ink-100 text-ink-700 text-[13px] font-bold flex items-center justify-center gap-2 transition">
          <MapIcon size={14} /> Prikaži rutu
        </button>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl bg-ink-50 ring-1 ring-ink-100 p-2.5">
      <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-ink-400 inline-flex items-center gap-1">
        {icon} {label}
      </div>
      <div
        className={`text-[16px] font-bold leading-tight mt-0.5 ${
          warn ? "text-signal-red" : "text-ink-900"
        }`}
      >
        {value}
        <span className="text-[11px] text-ink-400 font-semibold ml-0.5">
          {unit}
        </span>
      </div>
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
