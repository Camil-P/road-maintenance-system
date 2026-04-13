import type { Feature, FeatureCollection } from "geojson";

export function filterByLayerType(
  fc: FeatureCollection | undefined,
  layerType: string
): FeatureCollection {
  if (!fc) return { type: "FeatureCollection", features: [] };
  return {
    type: "FeatureCollection",
    features: fc.features.filter(
      (f: Feature) => f.properties?.layerType === layerType
    ),
  };
}
