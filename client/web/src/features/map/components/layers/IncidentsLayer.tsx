import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { CircleLayerSpecification } from "maplibre-gl";

interface Props {
  data: FeatureCollection;
}

const circleStyle: CircleLayerSpecification = {
  id: "incidents-circle",
  type: "circle",
  source: "incidents",
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      7, 4,
      14, 8,
    ],
    "circle-color": [
      "match",
      ["get", "status"],
      "Reported",
      "#ef4444",
      "Verified",
      "#3b82f6",
      "WorkOrderIssued",
      "#f59e0b",
      "Resolved",
      "#22c55e",
      "Rejected",
      "#6b7280",
      "#94a3b8",
    ],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
    "circle-opacity": 0.9,
  },
};

export function IncidentsLayer({ data }: Props) {
  return (
    <Source id="incidents" type="geojson" data={data}>
      <Layer {...circleStyle} />
    </Source>
  );
}
