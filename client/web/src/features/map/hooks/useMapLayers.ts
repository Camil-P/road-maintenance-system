import { useState, useCallback } from "react";

export type LayerKey = "roads" | "incidents" | "workZones";

export function useMapLayers() {
  const [visibility, setVisibility] = useState<Record<LayerKey, boolean>>({
    roads: true,
    incidents: true,
    workZones: true,
  });

  const toggle = useCallback((layer: LayerKey) => {
    setVisibility((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  return { visibility, toggle };
}
