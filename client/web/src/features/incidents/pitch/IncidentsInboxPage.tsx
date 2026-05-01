import { useMemo, useState } from "react";
import { MapCanvas } from "@/features/map/citizen/MapCanvas";
import { CITY_CENTER, WORK_SEGMENTS } from "@/features/map/citizen/data";
import type { Hazard, UserLocation } from "@/features/map/citizen/types";
import { flyTo } from "@/features/map/citizen/mapBridge";
import { AGENCY_INCIDENTS } from "./mockData";
import { IncidentListPanel } from "./IncidentListPanel";
import { IncidentDetail } from "./IncidentDetail";

export function IncidentsInboxPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hazards: Hazard[] = useMemo(
    () =>
      AGENCY_INCIDENTS.map((i) => ({
        id: i.id,
        type: i.type,
        lng: i.lng,
        lat: i.lat,
        note: i.note,
        reportedBy:
          i.reporter.trust === "verified" ? "city" : "community",
        minsAgo: i.minsAgo,
      })),
    []
  );

  const userLocation: UserLocation = {
    lng: CITY_CENTER[0],
    lat: CITY_CENTER[1],
  };

  const selected = selectedId
    ? AGENCY_INCIDENTS.find((i) => i.id === selectedId) ?? null
    : null;

  const onSelect = (id: string) => {
    setSelectedId(id);
    const i = AGENCY_INCIDENTS.find((x) => x.id === id);
    if (i) flyTo(i.lng, i.lat, 16.2);
  };

  return (
    <div
      className="citizen-root fixed inset-0 h-[100dvh] w-full overflow-hidden bg-ink-50 flex"
      style={{ fontFamily: "Inter Tight, system-ui, sans-serif" }}
    >
      <IncidentListPanel
        incidents={AGENCY_INCIDENTS}
        selectedId={selectedId}
        onSelect={onSelect}
      />

      <div className="relative flex-1 hidden lg:block">
        <MapCanvas
          hazards={hazards}
          workSegments={WORK_SEGMENTS}
          userLocation={userLocation}
          pendingLocation={null}
          onHazardClick={(h) => onSelect(h.id)}
        />

        <div className="pointer-events-none absolute top-4 left-4 right-4 flex justify-between items-start gap-3">
          <div className="pointer-events-auto bg-white/92 backdrop-blur-xl rounded-2xl ring-1 ring-black/5 shadow-soft px-3 py-2 text-[12px] text-ink-700">
            <div className="font-bold tracking-wider text-[10.5px] text-brand-500 uppercase">
              Region · Novi Pazar
            </div>
            <div className="text-[13px] font-bold text-ink-900 leading-tight">
              {AGENCY_INCIDENTS.length} aktivnih prijava
            </div>
          </div>

          <div className="pointer-events-auto bg-white/92 backdrop-blur-xl rounded-full ring-1 ring-black/5 shadow-soft px-3 py-1.5 flex items-center gap-3 text-[11px] text-ink-600">
            <LegendDot color="#E5484D" label="Hitno" />
            <LegendDot color="#FF5A1F" label="Visok" />
            <LegendDot color="#9B9FAD" label="Normalan" />
          </div>
        </div>

        {selected && (
          <IncidentDetail
            key={selected.id}
            incident={selected}
            onClose={() => setSelectedId(null)}
          />
        )}
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
