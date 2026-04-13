import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { LineLayerSpecification } from "maplibre-gl";

interface Props {
  data: FeatureCollection;
}

const lineStyle: LineLayerSpecification = {
  id: "road-segments-line",
  type: "line",
  source: "road-segments",
  paint: {
    "line-width": 4,
    "line-color": [
      "match",
      ["get", "status"],
      "Open",
      "#22c55e",
      "WorksInProgress",
      "#f59e0b",
      "Closed",
      "#ef4444",
      "Dangerous",
      "#dc2626",
      "#94a3b8",
    ],
    "line-opacity": 0.85,
  },
};

const labelStyle = {
  id: "road-segments-label",
  type: "symbol" as const,
  source: "road-segments",
  layout: {
    "text-field": ["get", "name"],
    "text-size": 11,
    "text-offset": [0, -1],
    "text-anchor": "bottom" as const,
    "symbol-placement": "line" as const,
  },
  paint: {
    "text-color": "#334155",
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.5,
  },
  minzoom: 12,
};

export function RoadSegmentsLayer({ data }: Props) {
  return (
    <Source id="road-segments" type="geojson" data={data}>
      <Layer {...lineStyle} />
      <Layer {...labelStyle} />
    </Source>
  );
}
