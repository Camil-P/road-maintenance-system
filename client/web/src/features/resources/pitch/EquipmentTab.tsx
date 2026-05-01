import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Coins,
  PackageCheck,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";
import { MapCanvas, type MapVehicleMarker } from "@/features/map/citizen/MapCanvas";
import { CITY_CENTER } from "@/features/map/citizen/data";
import type { UserLocation } from "@/features/map/citizen/types";
import {
  CATEGORY_LABEL,
  DEPOTS,
  EQUIPMENT,
  STOCK_TONE,
} from "./mockData";
import type { EquipmentCategory, EquipmentItem, StockLevel } from "./types";

interface Props {
  query: string;
}

const LEVEL_LABEL: Record<StockLevel, string> = {
  ok: "U redu",
  low: "Nisko",
  critical: "Kritično",
  overstock: "Višak",
};

export function EquipmentTab({ query }: Props) {
  const [filter, setFilter] = useState<EquipmentCategory | "all">("all");

  const filtered = useMemo(() => {
    let list = EQUIPMENT;
    if (filter !== "all") list = list.filter((e) => e.category === filter);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          CATEGORY_LABEL[e.category].toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<EquipmentCategory, EquipmentItem[]>();
    filtered.forEach((e) => {
      const arr = map.get(e.category) ?? [];
      arr.push(e);
      map.set(e.category, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const totals = useMemo(() => {
    const critical = EQUIPMENT.filter((e) => e.level === "critical").length;
    const low = EQUIPMENT.filter((e) => e.level === "low").length;
    const value = EQUIPMENT.reduce((s, e) => s + (e.unitCost ?? 0) * e.qty, 0);
    return { critical, low, value };
  }, []);

  const depotMarkers: MapVehicleMarker[] = DEPOTS.map((d) => {
    const itemsHere = EQUIPMENT.filter((e) => e.depotId === d.id);
    const lowOrCrit = itemsHere.filter(
      (e) => e.level === "low" || e.level === "critical"
    ).length;
    return {
      id: d.id,
      lng: d.lng,
      lat: d.lat,
      heading: 0,
      color: lowOrCrit > 2 ? "#E5484D" : lowOrCrit > 0 ? "#F5A524" : "#2BB673",
      label: d.name,
      pulsing: lowOrCrit > 0,
    };
  });

  const userLocation: UserLocation = {
    lng: CITY_CENTER[0],
    lat: CITY_CENTER[1],
  };

  return (
    <div className="grid grid-cols-12 gap-5 h-[calc(100dvh-160px)]">
      <div className="col-span-7 flex flex-col gap-4 min-h-0">
        <div className="grid grid-cols-4 gap-3">
          <Kpi
            icon={<AlertTriangle size={13} />}
            label="Kritično nisko"
            value={`${totals.critical}`}
            tone="text-signal-red"
          />
          <Kpi
            icon={<AlertTriangle size={13} />}
            label="Nisko stanje"
            value={`${totals.low}`}
            tone="text-signal-amber"
          />
          <Kpi
            icon={<Coins size={13} />}
            label="Vrednost zaliha"
            value={`${(totals.value / 1000).toFixed(1)}k €`}
          />
          <Kpi
            icon={<Warehouse size={13} />}
            label="Depoa"
            value={`${DEPOTS.length}`}
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="Sve"
            count={EQUIPMENT.length}
          />
          {(Object.keys(CATEGORY_LABEL) as EquipmentCategory[]).map((c) => (
            <FilterChip
              key={c}
              active={filter === c}
              onClick={() => setFilter(c)}
              label={CATEGORY_LABEL[c]}
              count={EQUIPMENT.filter((e) => e.category === c).length}
            />
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto nice-scroll space-y-4 pr-1">
          {grouped.map(([cat, items]) => (
            <div
              key={cat}
              className="rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-ink-100 bg-ink-50 flex items-center justify-between">
                <div className="text-[11.5px] font-bold tracking-wide text-ink-700 uppercase inline-flex items-center gap-1.5">
                  <CategoryIcon cat={cat} /> {CATEGORY_LABEL[cat]}
                </div>
                <div className="text-[10.5px] text-ink-400 font-semibold">
                  {items.length} stavki
                </div>
              </div>
              <div className="divide-y divide-ink-100">
                {items.map((it) => (
                  <ItemRow key={it.id} item={it} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="col-span-5 flex flex-col gap-4 min-h-0">
        <div className="rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-brand-500/10 text-brand-500 grid place-items-center">
                <Warehouse size={13} />
              </span>
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.14em] text-brand-500 uppercase">
                  Depoi i magacini
                </div>
                <div className="text-[13px] font-bold text-ink-900 leading-tight">
                  {DEPOTS.length} lokacija
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10.5px] text-ink-500">
              <LegendDot color="#2BB673" label="OK" />
              <LegendDot color="#F5A524" label="Nisko" />
              <LegendDot color="#E5484D" label="Kritično" />
            </div>
          </div>
          <div className="relative h-[300px]">
            <MapCanvas
              hazards={[]}
              userLocation={userLocation}
              pendingLocation={null}
              vehicles={depotMarkers}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-ink-100 overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="px-4 py-3 border-b border-ink-100">
            <div className="text-[10.5px] font-bold tracking-[0.14em] text-brand-500 uppercase">
              Hitne nabavke
            </div>
            <div className="text-[13px] font-bold text-ink-900 leading-tight">
              Predlozi za danas
            </div>
          </div>
          <div className="flex-1 overflow-y-auto nice-scroll p-3 space-y-2">
            {EQUIPMENT.filter(
              (e) => e.level === "critical" || e.level === "low"
            )
              .sort((a, b) => (a.level === "critical" ? -1 : 1))
              .map((e) => (
                <ReorderRow key={e.id} item={e} />
              ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold transition
        ${
          active
            ? "bg-ink-900 text-white"
            : "bg-white ring-1 ring-ink-100 text-ink-600 hover:ring-ink-200"
        }`}
    >
      {label}
      <span
        className={`text-[10px] px-1.5 rounded-full ${
          active ? "bg-white/20 text-white" : "bg-ink-50 ring-1 ring-ink-100 text-ink-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ItemRow({ item }: { item: EquipmentItem }) {
  const pct = Math.min(150, Math.round((item.qty / Math.max(1, item.threshold)) * 100));
  const depot = DEPOTS.find((d) => d.id === item.depotId);
  return (
    <div className="px-4 py-3 grid grid-cols-[2fr_2fr_1.2fr_0.8fr] items-center gap-3">
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-ink-900 truncate">{item.name}</div>
        <div className="text-[11px] text-ink-400 truncate">
          {depot?.name || "—"}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[10.5px] mb-1">
          <span className="font-semibold text-ink-700">
            {item.qty.toLocaleString("sr-RS")} {item.unit}
          </span>
          <span className="text-ink-400">
            prag {item.threshold.toLocaleString("sr-RS")} {item.unit}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, pct)}%`,
              background:
                item.level === "critical"
                  ? "#E5484D"
                  : item.level === "low"
                    ? "#F5A524"
                    : item.level === "overstock"
                      ? "#0F7AB3"
                      : "#2BB673",
            }}
          />
        </div>
      </div>

      <div>
        <span
          className={`text-[10.5px] font-bold tracking-wide uppercase rounded-full px-2 py-0.5 ${
            item.level === "critical"
              ? "bg-signal-red/15 text-signal-red ring-1 ring-signal-red/30"
              : item.level === "low"
                ? "bg-signal-amber/15 text-signal-amber ring-1 ring-signal-amber/30"
                : item.level === "overstock"
                  ? "bg-signal-ice/15 text-[#0F7AB3] ring-1 ring-signal-ice/40"
                  : "bg-signal-green/15 text-signal-green ring-1 ring-signal-green/30"
          }`}
        >
          {LEVEL_LABEL[item.level]}
        </span>
        <div className={`text-[10.5px] mt-1 ${STOCK_TONE[item.level]} font-semibold`}>
          {pct}% praga
        </div>
      </div>

      <div className="text-right text-[11px] text-ink-500">
        {item.lastDelivery && (
          <div>
            <span className="text-ink-400">isporuka</span>
            <div className="font-semibold text-ink-700">{item.lastDelivery}</div>
          </div>
        )}
        {item.unitCost && (
          <div className="mt-0.5">
            {item.unitCost.toLocaleString("sr-RS")} €/{item.unit}
          </div>
        )}
      </div>
    </div>
  );
}

function ReorderRow({ item }: { item: EquipmentItem }) {
  const depot = DEPOTS.find((d) => d.id === item.depotId);
  return (
    <div className="rounded-xl bg-ink-50 ring-1 ring-ink-100 p-2.5 flex items-center gap-2.5">
      <span
        className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 text-white`}
        style={{
          background: item.level === "critical" ? "#E5484D" : "#F5A524",
        }}
      >
        {item.level === "critical" ? <AlertTriangle size={13} /> : <PackageCheck size={13} />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold text-ink-900 truncate">{item.name}</div>
        <div className="text-[10.5px] text-ink-500 truncate">
          {depot?.name} · trenutno{" "}
          <span className="font-bold text-ink-700">
            {item.qty} {item.unit}
          </span>
          {item.reorderQty && (
            <>
              {" "}
              · predlog{" "}
              <span className="font-bold text-ink-700">
                +{item.reorderQty} {item.unit}
              </span>
            </>
          )}
        </div>
      </div>
      <button className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-white ring-1 ring-ink-200 text-ink-700 text-[10.5px] font-bold hover:bg-ink-100">
        <Truck size={11} /> Naruči
      </button>
    </div>
  );
}

function CategoryIcon({ cat }: { cat: EquipmentCategory }) {
  switch (cat) {
    case "consumable":
      return <Boxes size={12} />;
    case "traffic_gear":
      return <AlertTriangle size={12} />;
    case "machinery":
      return <Wrench size={12} />;
    case "small_tools":
      return <Wrench size={12} />;
    case "ppe":
      return <PackageCheck size={12} />;
  }
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
