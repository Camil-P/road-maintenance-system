import { useRef, useCallback, useState } from "react";
import MapGL, {
  NavigationControl,
  type MapRef,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapGeoJson } from "@/api/mapData";
import { useMapLayers } from "../hooks/useMapLayers";
import { RoadSegmentsLayer } from "./layers/RoadSegmentsLayer";
import { IncidentsLayer } from "./layers/IncidentsLayer";
import { WorkZonesLayer } from "./layers/WorkZonesLayer";
import { IncidentLinesLayer } from "./layers/IncidentLinesLayer";
import { MapSidebar } from "./panels/MapSidebar";
import { FeatureDetailPanel } from "./panels/FeatureDetailPanel";
import { WorkZoneDetailPanel } from "./panels/WorkZoneDetailPanel";
import { filterByLayerType } from "../utils/geoUtils";
import { ReportIncidentTool } from "./tools/ReportIncidentTool";
import { MarkWorkZoneTool } from "./tools/MarkWorkZoneTool";
import { AlertTriangle, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateWorkZoneMutation, AffectedLaneValues } from "@/api/workZones";
import type { Feature } from "geojson";

const SERBIA_CENTER = { longitude: 20.46, latitude: 44.01 };
const INITIAL_ZOOM = 7;

const MAP_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=${
  import.meta.env.VITE_MAPTILER_KEY || "get_your_free_key"
}`;

type ActiveTool = null | "report-incident" | "mark-work-zone";

export function RoadMap() {
  const mapRef = useRef<MapRef>(null);
  const { data: geojson, isLoading, refetch } = useMapGeoJson();
  const { visibility, toggle } = useMapLayers();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedWorkZoneId, setSelectedWorkZoneId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const { mutateAsync: createWorkZone } = useCreateWorkZoneMutation();

  const roads = filterByLayerType(geojson, "road-segment");
  const incidents = filterByLayerType(geojson, "incident");
  const incidentLines = filterByLayerType(geojson, "incident-line");
  const workZones = filterByLayerType(geojson, "work-zone");

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (activeTool || selectedWorkZoneId) return;
      const feature = e.features?.[0];
      if (feature) {
        if (feature.properties?.layerType === "work-zone") {
          setSelectedWorkZoneId(feature.properties.id);
          setSelectedFeature(null);
        } else {
          setSelectedFeature(feature as unknown as Feature);
          setSelectedWorkZoneId(null);
        }
      } else {
        setSelectedFeature(null);
        setSelectedWorkZoneId(null);
      }
    },
    [activeTool]
  );

  const handleToolDone = useCallback(async () => {
    setActiveTool(null);
    await refetch();
  }, [refetch]);

  return (
    <div className="relative flex h-full w-full">
      <MapSidebar
        visibility={visibility}
        onToggle={toggle}
        roadCount={roads.features.length}
        incidentCount={incidents.features.length + incidentLines.features.length}
        workZoneCount={workZones.features.length}
        isLoading={isLoading}
      />

      <div className="flex-1 relative">
        <MapGL
          ref={mapRef}
          initialViewState={{
            ...SERBIA_CENTER,
            zoom: INITIAL_ZOOM,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLE}
          onClick={handleClick}
          interactiveLayerIds={
            activeTool
              ? []
              : [
                  "road-segments-line",
                  "incidents-circle",
                  "incident-lines",
                  "work-zones-line",
                ]
          }
          cursor={activeTool ? "crosshair" : undefined}
        >
          <NavigationControl position="top-right" />

          {visibility.roads && <RoadSegmentsLayer data={roads} />}
          {visibility.incidents && <IncidentsLayer data={incidents} />}
          {visibility.incidents && <IncidentLinesLayer data={incidentLines} />}
          {visibility.workZones && <WorkZonesLayer data={workZones} />}

          {activeTool === "report-incident" && (
            <ReportIncidentTool onDone={handleToolDone} />
          )}

          {activeTool === "mark-work-zone" && (
            <MarkWorkZoneTool
              onSave={async (data) => {
                await createWorkZone({
                  name: data.name,
                  geometryJson: data.geometryJson,
                  lengthMeters: data.lengthMeters,
                  affectedLane: AffectedLaneValues[data.affectedLane as keyof typeof AffectedLaneValues],
                });
                await handleToolDone();
              }}
              onCancel={() => setActiveTool(null)}
            />
          )}
        </MapGL>

        {/* Toolbar */}
        {!activeTool && (
          <div className="absolute top-4 right-16 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow"
              onClick={() => setActiveTool("report-incident")}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Prijavi oštećenje
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow"
              onClick={() => setActiveTool("mark-work-zone")}
            >
              <Construction className="h-4 w-4 mr-1" />
              Označi radnu zonu
            </Button>
          </div>
        )}

        {selectedFeature && !activeTool && !selectedWorkZoneId && (
          <FeatureDetailPanel
            feature={selectedFeature}
            onClose={() => setSelectedFeature(null)}
          />
        )}

        {selectedWorkZoneId && !activeTool && (
          <WorkZoneDetailPanel
            workZoneId={selectedWorkZoneId}
            onClose={() => setSelectedWorkZoneId(null)}
          />
        )}
      </div>
    </div>
  );
}
