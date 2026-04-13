import { useQuery } from "@tanstack/react-query";
import { httpClient } from "./httpClient";

export interface MapGeoJson {
  type: "FeatureCollection";
  features: GeoJSON.Feature[];
}

async function fetchMapGeoJson(): Promise<MapGeoJson> {
  const res = await httpClient.get<MapGeoJson>("/map/geojson");
  return res.data;
}

export function useMapGeoJson() {
  return useQuery({
    queryKey: ["map", "geojson"],
    queryFn: fetchMapGeoJson,
    staleTime: 30_000,
  });
}
