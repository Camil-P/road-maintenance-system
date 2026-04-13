/**
 * Snap two (or more) points to the nearest road using OSRM public API
 * and return the actual road geometry between them.
 *
 * Uses the free OSRM demo server. For production, host your own instance.
 */
export async function snapToRoad(
  points: [number, number][]
): Promise<{ coordinates: [number, number][]; distanceMeters: number } | null> {
  if (points.length < 2) return null;

  const coords = points.map((p) => `${p[0]},${p[1]}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.length) return null;

    const route = data.routes[0];
    return {
      coordinates: route.geometry.coordinates as [number, number][],
      distanceMeters: route.distance as number,
    };
  } catch {
    return null;
  }
}
