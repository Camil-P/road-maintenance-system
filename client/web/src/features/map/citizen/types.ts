export type IncidentTypeId = "pothole" | "ice" | "sign" | "debris" | "flood" | "light";

export type LucideIconName =
  | "Construction"
  | "Snowflake"
  | "Signpost"
  | "Trash2"
  | "Droplets"
  | "LightbulbOff"
  | "AlertTriangle";

export interface IncidentType {
  id: IncidentTypeId;
  label: string;
  icon: LucideIconName;
  color: string;
  tint: string;
}

export type Reporter = "community" | "city" | "you";

export interface Hazard {
  id: string;
  type: IncidentTypeId;
  lng: number;
  lat: number;
  note: string;
  reportedBy: Reporter;
  minsAgo: number;
}

export type NewsSeverity = "closure" | "alert" | "info";

export interface NewsItem {
  id: string;
  severity: NewsSeverity;
  headline: string;
  detail: string;
}

export type WorkSeverity = "closure" | "major" | "minor";
export type WorkStatus = "active" | "scheduled";

export interface WorkSegment {
  id: string;
  title: string;
  crew: string;
  status: WorkStatus;
  severity: WorkSeverity;
  startsAt: string;
  endsAt: string;
  detail: string;
  coords: [number, number][];
}

export type ReportStatus = "received" | "in_progress" | "resolved";

export interface UserLocation {
  lng: number;
  lat: number;
  address?: string;
  accuracy?: number;
}

export interface MyReport {
  id: string;
  type: IncidentTypeId;
  status: ReportStatus;
  submitted: string;
  address: string;
  note?: string;
  loc?: UserLocation;
  photo?: string | null;
}
