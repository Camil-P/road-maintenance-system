import { useState, useEffect } from "react";
import { Source, Layer, Marker, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { LineLayerSpecification } from "maplibre-gl";
import { useCreateIncidentMutation } from "@/api/incidents";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { snapToRoad } from "../../utils/routeSnap";

interface Props {
  onDone: () => void;
}

type Mode = "choose" | "point" | "line-start" | "line-end" | "snapping" | "form";

const INCIDENT_TYPES = [
  { value: "Pothole", label: "Rupa na putu" },
  { value: "Ice", label: "Led" },
  { value: "Debris", label: "Krhotine/Otpad" },
  { value: "Flooding", label: "Poplava" },
  { value: "TrafficLightIssue", label: "Problem sa semaforom" },
  { value: "GuardrailDamage", label: "Oštećena ograda" },
  { value: "RoadMarkingIssue", label: "Problem s oznakama" },
  { value: "SignIssue", label: "Problem sa znakom" },
  { value: "Other", label: "Ostalo" },
];

const previewLineStyle: LineLayerSpecification = {
  id: "incident-preview-line",
  type: "line",
  source: "incident-preview",
  paint: {
    "line-width": 5,
    "line-color": "#ef4444",
    "line-dasharray": [3, 2],
    "line-opacity": 0.9,
  },
};

export function ReportIncidentTool({ onDone }: Props) {
  const { current: map } = useMap();
  const [mode, setMode] = useState<Mode>("choose");
  // Raw clicked points (start/end markers)
  const [clickedPoints, setClickedPoints] = useState<[number, number][]>([]);
  // Snapped road geometry (from OSRM)
  const [snappedCoords, setSnappedCoords] = useState<[number, number][] | null>(null);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [type, setType] = useState("Pothole");
  const [description, setDescription] = useState("");
  const { mutate, isPending, error } = useCreateIncidentMutation();

  useEffect(() => {
    if (!map || mode === "choose" || mode === "form" || mode === "snapping") return;

    const handler = (e: MapLayerMouseEvent) => {
      const coord: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (mode === "point") {
        setClickedPoints([coord]);
        setMode("form");
      } else if (mode === "line-start") {
        setClickedPoints([coord]);
        setMode("line-end");
      } else if (mode === "line-end") {
        const start = clickedPoints[0];
        const end = coord;
        setClickedPoints([start, end]);
        setMode("snapping");

        // Snap to road via OSRM
        snapToRoad([start, end]).then((result) => {
          if (result) {
            setSnappedCoords(result.coordinates);
            setDistanceMeters(result.distanceMeters);
          } else {
            // Fallback: straight line
            setSnappedCoords([start, end]);
            setDistanceMeters(0);
          }
          setMode("form");
        });
      }
    };

    map.on("click", handler);
    map.getCanvas().style.cursor = "crosshair";
    return () => {
      map.off("click", handler);
      map.getCanvas().style.cursor = "";
    };
  }, [map, mode, clickedPoints]);

  const isLine = snappedCoords !== null && snappedCoords.length >= 2;

  const previewData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: isLine
      ? [{
          type: "Feature",
          geometry: { type: "LineString", coordinates: snappedCoords },
          properties: {},
        }]
      : [],
  };

  const handleSubmit = () => {
    if (clickedPoints.length === 0 || description.length < 10) return;

    const payload: any = {
      type,
      description,
    };

    if (isLine) {
      // Za dionicu - lat/lon je sredina, geometry je puna linija
      const midIdx = Math.floor(snappedCoords.length / 2);
      payload.latitude = snappedCoords[midIdx][1];
      payload.longitude = snappedCoords[midIdx][0];
      payload.geometryJson = JSON.stringify({
        type: "LineString",
        coordinates: snappedCoords,
      });
    } else {
      payload.latitude = clickedPoints[0][1];
      payload.longitude = clickedPoints[0][0];
    }

    mutate(payload, { onSuccess: () => onDone() });
  };

  const handleReset = () => {
    setClickedPoints([]);
    setSnappedCoords(null);
    setDistanceMeters(0);
    setMode("choose");
  };

  const serverError =
    (error as any)?.response?.data?.message ||
    (error as any)?.response?.data?.errors?.Description?.[0] ||
    undefined;

  return (
    <>
      {clickedPoints.map((p, i) => (
        <Marker key={i} longitude={p[0]} latitude={p[1]} anchor="center">
          <div className={`w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-bold text-white ${
            i === 0 ? "bg-green-500" : "bg-red-500"
          }`}>
            {clickedPoints.length > 1 ? (i === 0 ? "A" : "B") : ""}
          </div>
        </Marker>
      ))}

      <Source id="incident-preview" type="geojson" data={previewData}>
        <Layer {...previewLineStyle} />
      </Source>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border p-4 w-[420px] space-y-3 z-10">
        <h3 className="text-sm font-bold text-slate-800">Prijavi oštećenje</h3>

        {mode === "choose" && (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Kako želite označiti lokaciju?</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setMode("point")} className="flex-1">
                Jedna tačka
              </Button>
              <Button size="sm" variant="outline" onClick={() => setMode("line-start")} className="flex-1">
                Dionica puta (od-do)
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={onDone} className="w-full">Otkaži</Button>
          </div>
        )}

        {mode === "point" && (
          <p className="text-sm text-slate-500">Kliknite na mapu da označite tačku oštećenja</p>
        )}

        {mode === "line-start" && (
          <p className="text-sm text-slate-500">
            Kliknite na <strong>početak</strong> oštećene dionice (tačka A)
          </p>
        )}

        {mode === "line-end" && (
          <p className="text-sm text-slate-500">
            Kliknite na <strong>kraj</strong> oštećene dionice (tačka B)
          </p>
        )}

        {mode === "snapping" && (
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <p className="text-sm text-slate-500">Pronalazim put između tačaka...</p>
          </div>
        )}

        {mode === "form" && (
          <>
            <div className="text-xs text-slate-400 space-y-0.5">
              {isLine ? (
                <p>
                  Dionica: ~{Math.round(distanceMeters)} m duž puta
                  <button className="ml-2 text-blue-500 underline" onClick={handleReset}>ponovo</button>
                </p>
              ) : (
                <p>
                  Tačka: {clickedPoints[0][1].toFixed(5)}, {clickedPoints[0][0].toFixed(5)}
                  <button className="ml-2 text-blue-500 underline" onClick={handleReset}>ponovo</button>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Tip</label>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {INCIDENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Opis (min 10 karaktera)</label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opišite problem..." />
            </div>

            {serverError && <p className="text-xs text-red-600">{serverError}</p>}

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit} disabled={isPending || description.length < 10}>
                {isPending ? "Slanje..." : "Prijavi"}
              </Button>
              <Button size="sm" variant="ghost" onClick={onDone}>Otkaži</Button>
            </div>
          </>
        )}

        {(mode === "point" || mode === "line-start" || mode === "line-end") && (
          <Button size="sm" variant="ghost" onClick={onDone} className="w-full">Otkaži</Button>
        )}
      </div>
    </>
  );
}
