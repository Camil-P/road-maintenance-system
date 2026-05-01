import type { IncidentTypeId } from "@/features/map/citizen/types";
import type { CrewSummary } from "@/features/incidents/pitch/types";

export type WorkOrderStatus =
  | "created"
  | "in_progress"
  | "completed"
  | "blocked";

export type WorkType =
  | "asphalt_patch"
  | "sign_replace"
  | "snow_clearing"
  | "drainage"
  | "lighting"
  | "debris_removal"
  | "marking"
  | "emergency";

export interface WorkOrder {
  id: string;
  incidentId: string;
  incidentType: IncidentTypeId;
  workType: WorkType;
  title: string;
  address: string;
  status: WorkOrderStatus;
  priority: "urgent" | "high" | "normal" | "low";
  crew: CrewSummary;
  createdAt: string;
  scheduledFor: string;
  completedAt?: string | null;
  durationHours?: number;
  description: string;
  photoBefore: string | null;
  photoAfter: string | null;
  materials?: { name: string; qty: string }[];
  cost?: number; // EUR
}
