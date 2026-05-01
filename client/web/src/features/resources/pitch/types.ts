import type { VehicleKind, VehicleStatus } from "@/features/fleet/pitch/types";

export type AssetVehicleStatus = VehicleStatus | "service" | "decommissioned";

export interface AssetVehicle {
  id: string;
  fleetId?: string;
  plate: string;
  callSign: string;
  kind: VehicleKind;
  brand: string;
  model: string;
  year: number;
  acquiredOn: string;
  acquisitionCost: number;
  bookValue: number;
  totalKm: number;
  avgConsumption: number;
  yearlyCost: number;
  registrationUntil: string;
  technicalUntil: string;
  status: AssetVehicleStatus;
  assignedCrew?: string;
  driver?: string;
  notes?: string;
  alerts?: string[];
}

export type WorkerRole =
  | "asphalt_worker"
  | "driver"
  | "electrician"
  | "mechanic"
  | "inspector"
  | "dispatcher"
  | "signs_specialist"
  | "general";

export type Shift = "morning" | "afternoon" | "night" | "on_call";

export type WorkerStatus = "active" | "on_leave" | "training" | "sick" | "field";

export interface Certification {
  code: string;
  label: string;
  validUntil: string;
}

export interface Worker {
  id: string;
  name: string;
  initials: string;
  role: WorkerRole;
  crewId?: string;
  crewName?: string;
  shift: Shift;
  status: WorkerStatus;
  experienceYears: number;
  hiredOn: string;
  phone: string;
  certifications: Certification[];
  // Optional position when in field
  lng?: number;
  lat?: number;
}

export type EquipmentCategory =
  | "consumable"
  | "traffic_gear"
  | "machinery"
  | "small_tools"
  | "ppe";

export type StockLevel = "ok" | "low" | "critical" | "overstock";

export interface EquipmentItem {
  id: string;
  category: EquipmentCategory;
  name: string;
  unit: string;
  qty: number;
  threshold: number;
  reorderQty?: number;
  lastDelivery?: string;
  unitCost?: number;
  level: StockLevel;
  depotId: string;
  notes?: string;
}

export interface Depot {
  id: string;
  name: string;
  address: string;
  lng: number;
  lat: number;
}
