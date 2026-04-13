import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { LineLayerSpecification } from "maplibre-gl";

interface Props {
  data: FeatureCollection;
}

const lineStyle: LineLayerSpecification = {
  id: "incident-lines",
  type: "line",
  source: "incident-lines",
  paint: {
    "line-width": 5,
    "line-color": [
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
    "line-opacity": 0.8,
    "line-dasharray": [3, 2],
  },
};

export function IncidentLinesLayer({ data }: Props) {
  return (
    <Source id="incident-lines" type="geojson" data={data}>
      <Layer {...lineStyle} />
    </Source>
  );
}
