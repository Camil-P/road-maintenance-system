import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Coins,
  Fuel,
  Gauge,
  ShieldAlert,
  Truck,
  Wrench,
} from "lucide-react";
import { MapCanvas, type MapVehicleMarker } from "@/features/map/citizen/MapCanvas";
import { CITY_CENTER } from "@/features/map/citizen/data";
import type { UserLocation } from "@/features/map/citizen/types";
import { FLEET, STATUS_COLOR } from "@/features/fleet/pitch/mockData";
import { ASSET_VEHICLES } from "./mockData";
import type { AssetVehicle, AssetVehicleStatus } from "./types";
import { VEHICLE_KIND_LABEL } from "@/features/fleet/pitch/mockData";

const STATUS_LABEL: Record<AssetVehicleStatus, string> = {
  idle: "Slobodno",
  en_route: "Na putu",
  on_site: "Na terenu",
  returning: "Povratak",
  off_duty: "Van smene",
  service: "U servisu",
  decommissioned: "Otpisano",
};

const STATUS_COLORS: Record<AssetVehicleStatus, string> = {
  idle: "#2BB673",
  en_route: "#FF5A1F",
  on_site: "#0F7AB3",
  returning: "#7C5CFF",
  off_duty: "#9B9FAD",
  service: "#F5A524",
  decommissioned: "#1A1C22",
};

interface Props {
  query: string;
}

export function VehiclesTab({ query }: Props) {
  const [selectedId, setSelectedId] = useState<string>(ASSET_VEHICLES[0].id);

  const filtered = useMemo(() => {
    if (!query) return ASSET_VEHICLES;
    const q = query.toLowerCase();
    return ASSET_VEHICLES.filter(
      (v) =>
        v.plate.toLowerCase().includes(q) ||
        v.callSign.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.assignedCrew?.toLowerCase().includes(q) ||
        v.driver?.toLowerCase().includes(q)
    );
  }, [query]);

  const vehicleMarkers: MapVehicleMarker[] = useMemo(() => {
    return ASSET_VEHICLES.flatMap((av) => {
      if (!av.fleetId) return [];
      const fv = FLEET.find((f) => f.id === av.fleetId);
      if (!fv) return [];
      return [
        {
          id: av.id,
          lng: fv.lng,
          lat: fv.lat,
          heading: fv.heading,
          color: STATUS_COLOR[fv.status],
          label: av.callSign,
          pulsing: fv.status === "en_route",
          selected: av.id === selectedId,
        },
      ];
    });
  }, [selectedId]);

  const userLocation: UserLocation = {
    lng: CITY_CENTER[0],
    lat: CITY_CENTER[1],
  };

  const totals = useMemo(() => {
    const active = ASSET_VEHICLES.filter(
      (v) => v.status !== "decommissioned" && v.status !== "service"
    );
    const totalValue = ASSET_VEHICLES.reduce((s, v) => s + v.bookValue, 0);
    const yearlyCost = ASSET_VEHICLES.reduce((s, v) => s + v.yearlyCost, 0);
    const alerts = ASSET_VEHICLES.flatMap((v) => v.alerts ?? []).length;
    return { active: active.length, totalValue, yearlyCost, alerts };
  }, []);

  const selected = ASSET_VEHICLES.find((v) => v.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-12 gap-5 h-[calc(100dvh-160px)]">
      <div className="col-span-7 flex flex-col gap-4 min-h-0">
        <div className="grid grid-cols-4 gap-3">
          <Kpi icon={<Truck size={13} />} label="Aktivna vozila" value={`${totals.active}/${ASSET_VEHICLES.length}`} />
          <Kpi icon={<Coins size={13} />} label="Knjig. vrednost" value={`${(totals.totalValue / 1000).toFixed(0)}k €`} />
          <Kpi icon={<Wrench size={13} />} label="Godišnji trošak" value={`${(totals.yearlyCost / 1000).toFixed(1)}k €`} />
          <Kpi
            icon={<ShieldAlert size={13} />}
            label="Aktivne alarmne stavke"
            value={`${totals.alerts}`}
            tone={totals.alerts > 0 ? "text-signal-amber" : "text-ink-700"}
          />
        </div>

        <div className="flex-1 min-h-0 rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden flex flex-col">
          <div className="grid grid-cols-[2fr_1.4fr_1fr_1fr_1fr_0.7fr] px-4 py-2.5 text-[10.5px] font-bold tracking-wide text-ink-400 uppercase border-b border-ink-100 bg-ink-50">
            <div>Vozilo</div>
            <div>Ekipa / vozač</div>
            <div>Status</div>
            <div>Pređeno</div>
            <div>Reg / TP</div>
            <div className="text-right">Trošak</div>
          </div>

          <div className="flex-1 overflow-y-auto nice-scroll divide-y divide-ink-100">
            {filtered.map((v) => (
              <Row
                key={v.id}
                vehicle={v}
                active={v.id === selectedId}
                onClick={() => setSelectedId(v.id)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-[12.5px] text-ink-400">
                Nema vozila po ovim filterima.
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="col-span-5 flex flex-col gap-4 min-h-0">
        <div className="rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-brand-500/10 text-brand-500 grid place-items-center">
                <Truck size={13} />
              </span>
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.14em] text-brand-500 uppercase">
                  Pozicije vozila
                </div>
                <div className="text-[13px] font-bold text-ink-900 leading-tight">
                  {vehicleMarkers.length} u operativi
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10.5px] text-ink-500">
              <LegendDot color={STATUS_COLORS.idle} label="Slobodno" />
              <LegendDot color={STATUS_COLORS.en_route} label="Na putu" />
              <LegendDot color={STATUS_COLORS.on_site} label="Na terenu" />
            </div>
          </div>
          <div className="relative h-[300px]">
            <MapCanvas
              hazards={[]}
              userLocation={userLocation}
              pendingLocation={null}
              vehicles={vehicleMarkers}
              onVehicleClick={(id) => setSelectedId(id)}
            />
          </div>
        </div>

        {selected && <VehicleDetail vehicle={selected} />}
      </aside>
    </div>
  );
}

function Row({
  vehicle: v,
  active,
  onClick,
}: {
  vehicle: AssetVehicle;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`grid grid-cols-[2fr_1.4fr_1fr_1fr_1fr_0.7fr] items-center px-4 py-3 text-left transition w-full
        ${active ? "bg-brand-500/5" : "hover:bg-ink-50"}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="h-9 w-9 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 grid place-items-center shrink-0"
        >
          <Truck size={15} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-ink-900 truncate">
            {v.callSign} · <span className="font-mono text-ink-500">{v.plate}</span>
          </div>
          <div className="text-[11px] text-ink-400 truncate">
            {v.brand} {v.model} · {v.year}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-[12px] font-semibold text-ink-900 truncate">
          {v.assignedCrew || "—"}
        </div>
        <div className="text-[11px] text-ink-400 truncate">{v.driver || "—"}</div>
      </div>

      <div>
        <span
          className="inline-flex items-center gap-1 text-[10.5px] font-bold tracking-wide uppercase rounded-full px-2 py-0.5"
          style={{
            background: `${STATUS_COLORS[v.status]}1a`,
            color: STATUS_COLORS[v.status],
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: STATUS_COLORS[v.status] }}
          />
          {STATUS_LABEL[v.status]}
        </span>
      </div>

      <div className="text-[12px] text-ink-700 tabular-nums">
        {v.totalKm.toLocaleString("sr-RS")} km
      </div>

      <div className="text-[11px] text-ink-700 leading-tight">
        <div>R: {v.registrationUntil}</div>
        <div className="text-ink-400">TP: {v.technicalUntil}</div>
      </div>

      <div className="text-right text-[12px] text-ink-700 tabular-nums">
        {(v.yearlyCost / 1000).toFixed(1)}k €
      </div>
    </button>
  );
}

function VehicleDetail({ vehicle: v }: { vehicle: AssetVehicle }) {
  const ageYears = new Date().getFullYear() - v.year;
  const depreciation = Math.max(
    0,
    Math.round(((v.acquisitionCost - v.bookValue) / v.acquisitionCost) * 100)
  );
  return (
    <div className="rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 border-b border-ink-100 flex items-start gap-3">
        <span
          className="h-10 w-10 rounded-xl grid place-items-center text-white shrink-0"
          style={{ background: STATUS_COLORS[v.status] }}
        >
          <Truck size={17} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] font-bold tracking-[0.14em] text-brand-500 uppercase">
            {VEHICLE_KIND_LABEL[v.kind]}
          </div>
          <div className="text-[15.5px] font-bold text-ink-900 leading-tight truncate">
            {v.callSign}
          </div>
          <div className="text-[11.5px] text-ink-500 truncate">
            {v.brand} {v.model} · {v.year} ({ageYears} g.) · <span className="font-mono">{v.plate}</span>
          </div>
        </div>
      </div>

      {v.alerts && v.alerts.length > 0 && (
        <div className="px-4 py-2 bg-signal-amber/10 border-b border-signal-amber/20">
          {v.alerts.map((a, i) => (
            <div
              key={i}
              className="text-[11.5px] text-signal-amber font-semibold inline-flex items-center gap-1.5"
            >
              <AlertTriangle size={12} /> {a}
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-3 grid grid-cols-3 gap-2 border-b border-ink-100">
        <Stat icon={<Gauge size={11} />} label="Pređeno" value={`${v.totalKm.toLocaleString("sr-RS")} km`} />
        <Stat icon={<Fuel size={11} />} label="Potrošnja" value={`${v.avgConsumption.toFixed(1)} L/100`} />
        <Stat icon={<Coins size={11} />} label="Godišnji trošak" value={`${v.yearlyCost.toLocaleString("sr-RS")} €`} />
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-2 border-b border-ink-100">
        <DetailLabel label="Registracija">
          <div className="text-[12.5px] font-semibold text-ink-900 inline-flex items-center gap-1">
            <CalendarClock size={12} /> {v.registrationUntil}
          </div>
        </DetailLabel>
        <DetailLabel label="Tehnički pregled">
          <div className="text-[12.5px] font-semibold text-ink-900 inline-flex items-center gap-1">
            <CalendarClock size={12} /> {v.technicalUntil}
          </div>
        </DetailLabel>
        <DetailLabel label="Datum nabavke">
          <div className="text-[12.5px] font-semibold text-ink-900">{v.acquiredOn}</div>
        </DetailLabel>
        <DetailLabel label="Nabavna cena">
          <div className="text-[12.5px] font-semibold text-ink-900">
            {v.acquisitionCost.toLocaleString("sr-RS")} €
          </div>
        </DetailLabel>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-[11px] text-ink-500 mb-1.5">
          <span className="font-semibold">Knjigovodstvena vrednost</span>
          <span className="text-ink-700 font-bold">
            {v.bookValue.toLocaleString("sr-RS")} €
          </span>
        </div>
        <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
            style={{ width: `${100 - depreciation}%` }}
          />
        </div>
        <div className="mt-1 text-[10.5px] text-ink-400">
          Amortizovano <span className="font-bold text-ink-700">{depreciation}%</span> · ostatak vrednosti{" "}
          {v.bookValue > 0
            ? `${Math.round((v.bookValue / v.acquisitionCost) * 100)}%`
            : "0%"}
        </div>
      </div>

      <div className="px-4 pb-3 flex flex-wrap gap-2 mt-auto">
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 text-[12px] font-semibold hover:bg-ink-100">
          <Wrench size={12} /> Servisna istorija
        </button>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-ink-50 ring-1 ring-ink-100 text-ink-700 text-[12px] font-semibold hover:bg-ink-100">
          <Coins size={12} /> Trošak po nalogu
        </button>
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 ring-1 ring-ink-100 px-2.5 py-1.5">
      <div className="text-[9.5px] font-bold tracking-wide uppercase text-ink-400 inline-flex items-center gap-1">
        {icon} {label}
      </div>
      <div className="text-[12.5px] font-bold text-ink-900 leading-tight mt-0.5">{value}</div>
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="h-2 w-2 rounded-full ring-2 ring-white"
        style={{ background: color }}
      />
      <span>{label}</span>
    </span>
  );
}
