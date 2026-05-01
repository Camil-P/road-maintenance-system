export type SegmentClass = "primary" | "secondary" | "local" | "bypass";
export type SegmentCondition = "excellent" | "good" | "fair" | "poor" | "critical";
export type SegmentStatus = "open" | "under_works" | "restricted" | "closed";

export interface HistoryEntry {
  id: string;
  date: string;
  kind:
    | "incident"
    | "work_completed"
    | "inspection"
    | "audit"
    | "closure"
    | "open";
  title: string;
  details?: string;
  cost?: number;
  crew?: string;
  attachments?: number;
}

export interface RoadSegment {
  id: string;
  code: string;
  name: string;
  fromTo: string;
  klass: SegmentClass;
  lengthKm: number;
  status: SegmentStatus;
  condition: SegmentCondition;
  conditionScore: number;
  lastInspection: string;
  nextInspection: string;
  totalIncidents12mo: number;
  totalCost12mo: number;
  openIncidents: number;
  history: HistoryEntry[];
}
