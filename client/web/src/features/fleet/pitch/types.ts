export type VehicleStatus = "idle" | "en_route" | "on_site" | "returning" | "off_duty";

export type VehicleKind =
  | "asphalt_truck"
  | "patrol"
  | "snow_plow"
  | "service_van"
  | "emergency"
  | "tipper";

export interface FleetVehicle {
  id: string;
  plate: string;
  callSign: string;
  kind: VehicleKind;
  crewName: string;
  driver: string;
  status: VehicleStatus;
  lng: number;
  lat: number;
  heading: number;
  speedKmh: number;
  fuelPct: number;
  workOrderId?: string | null;
  destination?: string | null;
  etaMins?: number | null;
  lastPing: string;
}
