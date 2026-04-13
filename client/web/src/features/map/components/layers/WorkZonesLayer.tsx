import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { LineLayerSpecification } from "maplibre-gl";

interface Props {
  data: FeatureCollection;
}

// Right side work zones (positive offset)
const rightLaneStyle: LineLayerSpecification = {
  id: "work-zones-line",
  type: "line",
  source: "work-zones",
  filter: [
    "any",
    ["==", ["get", "affectedLane"], "RightOnly"],
    ["==", ["get", "affectedLane"], "Both"],
    ["!", ["has", "affectedLane"]],
  ],
  paint: {
    "line-width": 5,
    "line-color": "#f97316",
    "line-dasharray": [2, 1],
    "line-offset": 6,
    "line-opacity": 0.85,
  },
};

// Left side work zones (negative offset)
const leftLaneStyle: LineLayerSpecification = {
  id: "work-zones-line-left",
  type: "line",
  source: "work-zones",
  filter: [
    "any",
    ["==", ["get", "affectedLane"], "LeftOnly"],
    ["==", ["get", "affectedLane"], "Both"],
  ],
  paint: {
    "line-width": 5,
    "line-color": "#f97316",
    "line-dasharray": [2, 1],
    "line-offset": -6,
    "line-opacity": 0.85,
  },
};

export function WorkZonesLayer({ data }: Props) {
  return (
    <Source id="work-zones" type="geojson" data={data}>
      <Layer {...rightLaneStyle} />
      <Layer {...leftLaneStyle} />
    </Source>
  );
}
