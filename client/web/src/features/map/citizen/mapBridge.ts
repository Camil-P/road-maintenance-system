type FlyTo = (lng: number, lat: number, zoom?: number) => void;

let flyToImpl: FlyTo | null = null;

export function setFlyTo(fn: FlyTo | null) {
  flyToImpl = fn;
}

export function flyTo(lng: number, lat: number, zoom = 15.4) {
  flyToImpl?.(lng, lat, zoom);
}
