import { useState, useEffect } from "react";
import { Source, Layer, Marker, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { LineLayerSpecification } from "maplibre-gl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { snapToRoad } from "../../utils/routeSnap";

type AffectedLane = "Both" | "LeftOnly" | "RightOnly";
type Step = "start" | "end" | "snapping" | "details";

interface SaveData {
  name: string;
  affectedLane: AffectedLane;
  geometryJson: string;
  lengthMeters: number;
}

interface Props {
  onSave: (data: SaveData) => void;
  onCancel: () => void;
}

const previewRight: LineLayerSpecification = {
  id: "wz-preview-right",
  type: "line",
  source: "wz-preview",
  paint: { "line-width": 6, "line-color": "#f97316", "line-dasharray": [2, 1], "line-offset": 8, "line-opacity": 0.9 },
};

const previewLeft: LineLayerSpecification = {
  id: "wz-preview-left",
  type: "line",
  source: "wz-preview",
  paint: { "line-width": 6, "line-color": "#f97316", "line-dasharray": [2, 1], "line-offset": -8, "line-opacity": 0.9 },
};

const previewCenter: LineLayerSpecification = {
  id: "wz-preview-center",
  type: "line",
  source: "wz-preview",
  paint: { "line-width": 3, "line-color": "#f97316", "line-dasharray": [4, 3], "line-opacity": 0.5 },
};

export function MarkWorkZoneTool({ onSave, onCancel }: Props) {
  const { current: map } = useMap();
  const [step, setStep] = useState<Step>("start");
  const [clickedPoints, setClickedPoints] = useState<[number, number][]>([]);
  const [snappedCoords, setSnappedCoords] = useState<[number, number][] | null>(null);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [affectedLane, setAffectedLane] = useState<AffectedLane>("Both");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!map || step === "details" || step === "snapping") return;

    const handler = (e: MapLayerMouseEvent) => {
      const coord: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (step === "start") {
        setClickedPoints([coord]);
        setStep("end");
      } else if (step === "end") {
        const start = clickedPoints[0];
        const end = coord;
        setClickedPoints([start, end]);
        setStep("snapping");

        snapToRoad([start, end]).then((result) => {
          if (result) {
            setSnappedCoords(result.coordinates);
            setDistanceMeters(result.distanceMeters);
          } else {
            setSnappedCoords([start, end]);
          }
          setStep("details");
        });
      }
    };

    map.on("click", handler);
    map.getCanvas().style.cursor = "crosshair";
    return () => {
      map.off("click", handler);
      map.getCanvas().style.cursor = "";
    };
  }, [map, step, clickedPoints]);

  const hasLine = snappedCoords !== null && snappedCoords.length >= 2;

  const previewData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: hasLine
      ? [{ type: "Feature", geometry: { type: "LineString", coordinates: snappedCoords }, properties: {} }]
      : [],
  };

  const handleSave = () => {
    if (!hasLine || !name.trim()) return;
    onSave({
      name: name.trim(),
      affectedLane,
      geometryJson: JSON.stringify({ type: "LineString", coordinates: snappedCoords }),
      lengthMeters: Math.round(distanceMeters),
    });
  };

  const handleReset = () => {
    setClickedPoints([]);
    setSnappedCoords(null);
    setDistanceMeters(0);
    setStep("start");
  };

  const showRight = affectedLane === "Both" || affectedLane === "RightOnly";
  const showLeft = affectedLane === "Both" || affectedLane === "LeftOnly";

  return (
    <>
      {clickedPoints.map((p, i) => (
        <Marker key={i} longitude={p[0]} latitude={p[1]} anchor="center">
          <div className={`w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-bold text-white ${i === 0 ? "bg-green-500" : "bg-orange-500"}`}>
            {i === 0 ? "A" : "B"}
          </div>
        </Marker>
      ))}

      <Source id="wz-preview" type="geojson" data={previewData}>
        <Layer {...previewCenter} />
        {showRight && <Layer {...previewRight} />}
        {showLeft && <Layer {...previewLeft} />}
      </Source>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border p-4 w-[420px] space-y-3 z-10">
        <h3 className="text-sm font-bold text-slate-800">Označi radnu zonu</h3>

        {step === "start" && (
          <p className="text-sm text-slate-500">Kliknite na <strong>početak</strong> radne zone (tačka A)</p>
        )}

        {step === "end" && (
          <p className="text-sm text-slate-500">Kliknite na <strong>kraj</strong> radne zone (tačka B)</p>
        )}

        {step === "snapping" && (
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full" />
            <p className="text-sm text-slate-500">Pronalazim put između tačaka...</p>
          </div>
        )}

        {step === "details" && (
          <>
            <div className="text-xs text-slate-400">
              Dužina: ~{Math.round(distanceMeters)} m
              <button className="ml-2 text-blue-500 underline" onClick={handleReset}>ponovo</button>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Naziv radne zone</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='Npr. "Radovi na Bulevaru"' />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Strana puta</label>
              <Select value={affectedLane} onChange={(e) => setAffectedLane(e.target.value as AffectedLane)}>
                <option value="Both">Obe strane</option>
                <option value="LeftOnly">Samo leva strana</option>
                <option value="RightOnly">Samo desna strana</option>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={!name.trim()}>Sačuvaj</Button>
              <Button size="sm" variant="ghost" onClick={onCancel}>Otkaži</Button>
            </div>
          </>
        )}

        {(step === "start" || step === "end") && (
          <Button size="sm" variant="ghost" onClick={onCancel} className="w-full">Otkaži</Button>
        )}
      </div>
    </>
  );
}
