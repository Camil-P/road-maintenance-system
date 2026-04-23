import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Hazard, IncidentTypeId, UserLocation, WorkSegment } from "./types";
import { CITY_CENTER } from "./data";
import { setFlyTo } from "./mapBridge";

interface Props {
  hazards: Hazard[];
  workSegments?: WorkSegment[];
  userLocation: UserLocation | null;
  pendingLocation?: UserLocation | null;
  onHazardClick?: (h: Hazard) => void;
  onSegmentClick?: (id: string) => void;
}

const SEV_COLOR: Record<WorkSegment["severity"], string> = {
  closure: "#E5484D",
  major: "#FF5A1F",
  minor: "#F5A524",
};

export function MapCanvas({
  hazards,
  workSegments = [],
  userLocation,
  pendingLocation,
  onHazardClick,
  onSegmentClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const segMarkersRef = useRef<Record<string, { start: Marker; end: Marker }>>({});
  const userMarkerRef = useRef<Marker | null>(null);
  const pendingMarkerRef = useRef<Marker | null>(null);
  const [styleReady, setStyleReady] = useState(false);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "osm-raster": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap",
            maxzoom: 19,
          },
        },
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#EEECE6" } },
          {
            id: "osm",
            type: "raster",
            source: "osm-raster",
            paint: {
              "raster-saturation": -0.35,
              "raster-contrast": 0.05,
              "raster-brightness-min": 0.08,
            },
          },
        ],
      },
      center: CITY_CENTER,
      zoom: 14.2,
      pitch: 0,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("work-segments", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "work-casing",
        type: "line",
        source: "work-segments",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#ffffff", "line-width": 10, "line-opacity": 0.6 },
      });

      map.addLayer({
        id: "work-line",
        type: "line",
        source: "work-segments",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 6,
          "line-opacity": 0.95,
        },
      });

      map.addLayer({
        id: "work-line-dash",
        type: "line",
        source: "work-segments",
        layout: { "line-cap": "butt", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": 2,
          "line-dasharray": [1.5, 2],
          "line-opacity": ["case", ["==", ["get", "severity"], "closure"], 0.9, 0.0],
        },
      });

      map.on("click", "work-line", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (id) onSegmentClick?.(id);
      });
      map.on("mouseenter", "work-line", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "work-line", () => {
        map.getCanvas().style.cursor = "";
      });

      setStyleReady(true);
    });

    setFlyTo((lng, lat, zoom = 15.4) => {
      map.flyTo({ center: [lng, lat], zoom, speed: 1.2, essential: true });
    });

    return () => {
      setFlyTo(null);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync hazard markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const active = new Set<string>();
    hazards.forEach((h) => {
      active.add(h.id);
      if (markersRef.current[h.id]) return;

      const el = document.createElement("div");
      el.className = `hazard-pin ${h.type}`;
      el.innerHTML = iconSvgForType(h.type);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onHazardClick?.(h);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([h.lng, h.lat])
        .addTo(map);

      markersRef.current[h.id] = marker;
    });

    Object.keys(markersRef.current).forEach((id) => {
      if (!active.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [hazards, onHazardClick]);

  // Sync work segments
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const active = new Set<string>();
    workSegments.forEach((s) => {
      active.add(s.id);
      const color = SEV_COLOR[s.severity] || "#FF5A1F";
      const start = s.coords[0];
      const end = s.coords[s.coords.length - 1];

      if (!segMarkersRef.current[s.id]) {
        const startEl = document.createElement("div");
        startEl.className = "work-endpoint";
        startEl.innerHTML = endpointSvg("start", color);
        startEl.title = "Radovi počinju ovde";
        startEl.style.cursor = "pointer";
        startEl.addEventListener("click", (e) => {
          e.stopPropagation();
          onSegmentClick?.(s.id);
        });

        const endEl = document.createElement("div");
        endEl.className = "work-endpoint";
        endEl.innerHTML = endpointSvg("end", color);
        endEl.title = "Radovi se završavaju ovde";
        endEl.style.cursor = "pointer";
        endEl.addEventListener("click", (e) => {
          e.stopPropagation();
          onSegmentClick?.(s.id);
        });

        const m1 = new maplibregl.Marker({ element: startEl, anchor: "bottom" })
          .setLngLat(start)
          .addTo(map);
        const m2 = new maplibregl.Marker({ element: endEl, anchor: "bottom" })
          .setLngLat(end)
          .addTo(map);
        segMarkersRef.current[s.id] = { start: m1, end: m2 };
      } else {
        segMarkersRef.current[s.id].start.setLngLat(start);
        segMarkersRef.current[s.id].end.setLngLat(end);
      }
    });

    Object.keys(segMarkersRef.current).forEach((id) => {
      if (!active.has(id)) {
        segMarkersRef.current[id].start.remove();
        segMarkersRef.current[id].end.remove();
        delete segMarkersRef.current[id];
      }
    });

    const src = map.getSource("work-segments") as maplibregl.GeoJSONSource | undefined;
    if (src) {
      const features = workSegments.map((s) => ({
        type: "Feature" as const,
        properties: {
          id: s.id,
          severity: s.severity,
          color: SEV_COLOR[s.severity] || "#FF5A1F",
        },
        geometry: { type: "LineString" as const, coordinates: s.coords },
      }));
      src.setData({ type: "FeatureCollection", features });
    }
  }, [workSegments, styleReady, onSegmentClick]);

  // User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    } else {
      const dot = document.createElement("div");
      dot.className = "pulse-dot";
      userMarkerRef.current = new maplibregl.Marker({ element: dot, anchor: "center" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
    }
  }, [userLocation]);

  // Pending report marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pendingLocation) {
      if (pendingMarkerRef.current) {
        pendingMarkerRef.current.setLngLat([pendingLocation.lng, pendingLocation.lat]);
      } else {
        const el = document.createElement("div");
        el.style.width = "44px";
        el.style.height = "44px";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.innerHTML = `
          <svg viewBox="0 0 44 44" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="sh" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.35"/>
              </filter>
            </defs>
            <g filter="url(#sh)">
              <path d="M22 4 C13 4 6 11 6 20 C6 30 22 42 22 42 C22 42 38 30 38 20 C38 11 31 4 22 4 Z"
                    fill="#FF5A1F" stroke="white" stroke-width="2"/>
              <circle cx="22" cy="19" r="5" fill="white"/>
            </g>
          </svg>`;
        pendingMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([pendingLocation.lng, pendingLocation.lat])
          .addTo(map);
      }
    } else if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }
  }, [pendingLocation]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}

function endpointSvg(kind: "start" | "end", color: string) {
  const glyph =
    kind === "start"
      ? '<path d="M14 10h9l-2 3 2 3h-9z" fill="white"/><path d="M14 10v12" stroke="white" stroke-width="2" stroke-linecap="round"/>'
      : '<g fill="white"><rect x="14" y="10" width="3" height="3"/><rect x="20" y="10" width="3" height="3"/><rect x="17" y="13" width="3" height="3"/><rect x="14" y="16" width="3" height="3"/><rect x="20" y="16" width="3" height="3"/></g>';
  return `
    <svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="sh-${kind}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.35"/>
        </filter>
      </defs>
      <g filter="url(#sh-${kind})">
        <path d="M19 2 C10 2 4 8 4 17 C4 27 19 46 19 46 C19 46 34 27 34 17 C34 8 28 2 19 2 Z"
              fill="${color}" stroke="white" stroke-width="2"/>
        ${glyph}
      </g>
    </svg>`;
}

function iconSvgForType(type: IncidentTypeId) {
  const stroke = type === "ice" || type === "sign" ? "#0A0B0D" : "white";
  const paths: Record<IncidentTypeId, string> = {
    pothole:
      '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 12a6 6 0 0 1 12 0" stroke="currentColor" stroke-width="2" fill="none"/>',
    ice: '<path d="M12 2v20M4 6l16 12M4 18L20 6M2 12h20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
    sign: '<path d="M12 3v4M7 7h10l3 4-3 4H7l-3-4 3-4z M12 11v9" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    debris:
      '<path d="M4 8h16l-1 12H5L4 8z M9 4h6v4H9z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    flood:
      '<path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    light:
      '<path d="M9 18h6M10 21h4M8 9a4 4 0 1 1 8 0c0 2-2 3-2 5H10c0-2-2-3-2-5z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  };
  return `<svg width="18" height="18" viewBox="0 0 24 24" style="color:${stroke}">${paths[type] || paths.pothole}</svg>`;
}
