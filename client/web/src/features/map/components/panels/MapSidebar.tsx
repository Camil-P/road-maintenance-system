import type { LayerKey } from "../../hooks/useMapLayers";

interface Props {
  visibility: Record<LayerKey, boolean>;
  onToggle: (layer: LayerKey) => void;
  roadCount: number;
  incidentCount: number;
  workZoneCount: number;
  isLoading: boolean;
}

const layers: { key: LayerKey; label: string; color: string }[] = [
  { key: "roads", label: "Putevi", color: "#22c55e" },
  { key: "incidents", label: "Incidenti", color: "#ef4444" },
  { key: "workZones", label: "Radne zone", color: "#f97316" },
];

const statusLegend = [
  { label: "Otvoren", color: "#22c55e" },
  { label: "Radovi", color: "#f59e0b" },
  { label: "Zatvoren", color: "#ef4444" },
  { label: "Opasan", color: "#dc2626" },
];

const incidentLegend = [
  { label: "Prijavljen", color: "#ef4444" },
  { label: "Verificiran", color: "#3b82f6" },
  { label: "Nalog izdat", color: "#f59e0b" },
  { label: "Riješen", color: "#22c55e" },
];

export function MapSidebar({
  visibility,
  onToggle,
  roadCount,
  incidentCount,
  workZoneCount,
  isLoading,
}: Props) {
  const counts: Record<LayerKey, number> = {
    roads: roadCount,
    incidents: incidentCount,
    workZones: workZoneCount,
  };

  return (
    <div className="w-64 border-r bg-white p-4 space-y-5 overflow-y-auto">
      <h2 className="text-sm font-bold uppercase text-slate-500">Layeri</h2>

      {isLoading && (
        <p className="text-xs text-slate-400">Učitavanje podataka...</p>
      )}

      <div className="space-y-2">
        {layers.map((l) => (
          <label
            key={l.key}
            className="flex items-center gap-2 cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              checked={visibility[l.key]}
              onChange={() => onToggle(l.key)}
              className="accent-blue-600"
            />
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-slate-700">
              {l.label}{" "}
              <span className="text-slate-400">({counts[l.key]})</span>
            </span>
          </label>
        ))}
      </div>

      <hr className="border-slate-200" />

      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
          Status puta
        </h3>
        <div className="space-y-1">
          {statusLegend.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              <span
                className="w-4 h-1 rounded inline-block"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
          Status incidenta
        </h3>
        <div className="space-y-1">
          {incidentLegend.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
          Radna zona
        </h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-orange-500 inline-block" />
            <span className="text-slate-600">Radovi (isprekidano)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
