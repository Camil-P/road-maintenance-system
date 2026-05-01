export type NewsSeverity = "closure" | "alert" | "info" | "works";
export type NewsStatus = "published" | "draft" | "scheduled" | "archived";
export type NewsAudience = "all" | "drivers" | "residents" | "internal";

export interface AdminNewsItem {
  id: string;
  severity: NewsSeverity;
  status: NewsStatus;
  audience: NewsAudience;
  headline: string;
  detail: string;
  publishedAt?: string;
  scheduledFor?: string;
  expiresAt?: string;
  views: number;
  reach: number;
  pinned?: boolean;
  author: { name: string; initials: string };
  region: string;
}
