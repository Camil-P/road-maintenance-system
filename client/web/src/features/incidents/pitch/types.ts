import type { IncidentTypeId } from "@/features/map/citizen/types";

export type Priority = "urgent" | "high" | "normal" | "low";

export type AgencyStatus =
  | "new"
  | "triaged"
  | "in_progress"
  | "resolved"
  | "dismissed";

export interface Reporter {
  name: string;
  initials: string;
  trust: "verified" | "regular" | "anonymous";
}

export interface CrewSummary {
  id: string;
  name: string;
  vehicle?: string;
  members: number;
  available: boolean;
}

export interface AgencyIncident {
  id: string;
  type: IncidentTypeId;
  priority: Priority;
  status: AgencyStatus;
  lng: number;
  lat: number;
  address: string;
  note: string;
  photo: string | null;
  submittedAt: string;
  minsAgo: number;
  reporter: Reporter;
  assignedCrew?: CrewSummary | null;
  workOrderId?: string | null;
  duplicates?: number;
}
