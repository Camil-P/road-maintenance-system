import { useState } from "react";
import { X, History, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useWorkZoneByIdQuery,
  useUpdateWorkZoneProgressMutation,
  useCompleteWorkZoneMutation,
} from "@/api/workZones";
import { Source, Layer, Marker, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { LineLayerSpecification } from "maplibre-gl";
import { snapToRoad } from "../../utils/routeSnap";
import { useEffect } from "react";

interface Props {
  workZoneId: string;
  onClose: () => void;
}

type EditMode = "view" | "editing" | "snapping";

const editLineStyle: LineLayerSpecification = {
  id: "wz-edit-line",
  type: "line",
  source: "wz-edit",
  paint: { "line-width": 5, "line-color": "#22c55e", "line-dasharray": [3, 2], "line-opacity": 0.9 },
};

export function WorkZoneDetailPanel({ workZoneId, onClose }: Props) {
  const { data, refetch } = useWorkZoneByIdQuery(workZoneId);
  const { mutateAsync: updateProgress, isPending: isUpdating } = useUpdateWorkZoneProgressMutation();
  const { mutateAsync: complete, isPending: isCompleting } = useCompleteWorkZoneMutation();
  const { current: map } = useMap();

  const [showHistory, setShowHistory] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>("view");
  const [editPoints, setEditPoints] = useState<[number, number][]>([]);
  const [editSnapped, setEditSnapped] = useState<[number, number][] | null>(null);
  const [editDistance, setEditDistance] = useState(0);
  const [note, setNote] = useState("");
  const [completeNote, setCompleteNote] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [historyPreviewIdx, setHistoryPreviewIdx] = useState<number | null>(null);

  const zone = data?.data;

  // Click handler for editing
  useEffect(() => {
    if (!map || editMode !== "editing") return;

    const handler = (e: MapLayerMouseEvent) => {
      const coord: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (editPoints.length === 0) {
        setEditPoints([coord]);
      } else {
        const start = editPoints[0];
        const end = coord;
        setEditPoints([start, end]);
        setEditMode("snapping");

        snapToRoad([start, end]).then((result) => {
          if (result) {
            setEditSnapped(result.coordinates);
            setEditDistance(result.distanceMeters);
          } else {
            setEditSnapped([start, end]);
          }
          setEditMode("editing");
        });
      }
    };

    map.on("click", handler);
    map.getCanvas().style.cursor = "crosshair";
    return () => {
      map.off("click", handler);
      map.getCanvas().style.cursor = "";
    };
  }, [map, editMode, editPoints]);

  if (!zone) return null;

  const progressPercent = zone.progressPercent;

  const handleSaveProgress = async () => {
    if (!editSnapped || !note.trim()) return;
    await updateProgress({
      id: workZoneId,
      newGeometryJson: JSON.stringify({ type: "LineString", coordinates: editSnapped }),
      newRemainingLengthMeters: editDistance,
      note: note.trim(),
    });
    setEditMode("view");
    setEditPoints([]);
    setEditSnapped(null);
    setNote("");
    await refetch();
  };

  const handleComplete = async () => {
    if (!completeNote.trim()) return;
    await complete({ id: workZoneId, note: completeNote.trim() });
    await refetch();
    onClose();
  };

  const startEditing = () => {
    setEditMode("editing");
    setEditPoints([]);
    setEditSnapped(null);
    setEditDistance(0);
    setNote("");
  };

  const cancelEditing = () => {
    setEditMode("view");
    setEditPoints([]);
    setEditSnapped(null);
  };

  // Preview data for editing
  const editPreview: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: editSnapped
      ? [{ type: "Feature", geometry: { type: "LineString", coordinates: editSnapped }, properties: {} }]
      : [],
  };

  // History preview geometry
  const historyPreview: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: historyPreviewIdx !== null && zone.history[historyPreviewIdx]
      ? [{ type: "Feature", geometry: JSON.parse(zone.history[historyPreviewIdx].geometryJson), properties: {} }]
      : [],
  };

  return (
    <>
      {/* Edit markers */}
      {editPoints.map((p, i) => (
        <Marker key={`edit-${i}`} longitude={p[0]} latitude={p[1]} anchor="center">
          <div className={`w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-bold text-white ${i === 0 ? "bg-green-500" : "bg-orange-500"}`}>
            {i === 0 ? "A" : "B"}
          </div>
        </Marker>
      ))}

      <Source id="wz-edit" type="geojson" data={editPreview}>
        <Layer {...editLineStyle} />
      </Source>

      <Source id="wz-history-preview" type="geojson" data={historyPreview}>
        <Layer id="wz-history-line" type="line" source="wz-history-preview" paint={{ "line-width": 4, "line-color": "#8b5cf6", "line-dasharray": [4, 2], "line-opacity": 0.7 }} />
      </Source>

      <div className="absolute bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg border overflow-hidden z-10">
        {/* Header */}
        <div className="p-4 border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 truncate">{zone.name}</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              zone.status === "Active" ? "bg-green-100 text-green-700" :
              zone.status === "Paused" ? "bg-yellow-100 text-yellow-700" :
              "bg-slate-100 text-slate-700"
            }`}>{zone.statusName}</span>
            <span className="text-[10px] text-slate-400">{zone.affectedLaneName}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Progres</span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Završeno: {Math.round(zone.completedLengthMeters)} m</span>
            <span>Preostalo: {Math.round(zone.remainingLengthMeters)} m</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Ukupno: {Math.round(zone.originalLengthMeters)} m
          </div>
        </div>

        {/* Actions */}
        {zone.status === "Active" && editMode === "view" && (
          <div className="px-4 pb-3 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={startEditing}>
              Ažuriraj progres
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowComplete(!showComplete)}>
              {showComplete ? "Otkaži" : "Završi"}
            </Button>
          </div>
        )}

        {/* Complete form */}
        {showComplete && (
          <div className="px-4 pb-3 space-y-2">
            <Textarea rows={2} value={completeNote} onChange={(e) => setCompleteNote(e.target.value)} placeholder="Komentar o završetku..." />
            <Button size="sm" onClick={handleComplete} disabled={isCompleting || !completeNote.trim()} className="w-full">
              {isCompleting ? "..." : "Označi kao završeno"}
            </Button>
          </div>
        )}

        {/* Editing mode */}
        {editMode === "editing" && (
          <div className="px-4 pb-3 space-y-2">
            <p className="text-xs text-slate-500">
              {editPoints.length === 0
                ? "Kliknite novi POČETAK preostale zone (tačka A)"
                : editSnapped
                ? "Nova zona spremna. Dodajte komentar i sačuvajte."
                : "Kliknite novi KRAJ preostale zone (tačka B)"}
            </p>
            {editSnapped && (
              <>
                <p className="text-xs text-green-600">Nova dužina: ~{Math.round(editDistance)} m</p>
                <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Šta je urađeno? (npr. 'Završena dionica kod mosta')" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveProgress} disabled={isUpdating || !note.trim()} className="flex-1">
                    {isUpdating ? "..." : "Sačuvaj"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing}>Otkaži</Button>
                </div>
              </>
            )}
            {!editSnapped && editPoints.length > 0 && (
              <Button size="sm" variant="ghost" onClick={cancelEditing} className="w-full">Otkaži</Button>
            )}
          </div>
        )}

        {editMode === "snapping" && (
          <div className="px-4 pb-3 flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full" />
            <p className="text-xs text-slate-500">Pronalazim put...</p>
          </div>
        )}

        {/* History */}
        <div className="border-t">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs text-slate-600 hover:bg-slate-50"
          >
            <span className="flex items-center gap-1">
              <History className="h-3 w-3" />
              Historija izmjena ({zone.history.length})
            </span>
            {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showHistory && (
            <div className="px-4 pb-3 max-h-48 overflow-y-auto space-y-2">
              {zone.history.length === 0 && (
                <p className="text-xs text-slate-400">Nema izmjena</p>
              )}
              {zone.history.map((h, idx) => (
                <div
                  key={h.id}
                  className={`text-xs border rounded p-2 cursor-pointer transition-colors ${
                    historyPreviewIdx === idx ? "border-purple-400 bg-purple-50" : "hover:bg-slate-50"
                  }`}
                  onClick={() => setHistoryPreviewIdx(historyPreviewIdx === idx ? null : idx)}
                >
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      {new Date(h.createdAt).toLocaleDateString("sr-Latn")}
                    </span>
                    <span className="text-green-600 font-medium">
                      -{Math.round(h.completedMeters)} m
                    </span>
                  </div>
                  <p className="text-slate-700 mt-0.5">{h.note}</p>
                  <p className="text-slate-400 mt-0.5">
                    Bilo: {Math.round(h.totalLengthMeters)} m
                  </p>
                  {historyPreviewIdx === idx && (
                    <p className="text-purple-500 text-[10px] mt-1">
                      Prikazano na mapi (ljubičasta linija)
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
