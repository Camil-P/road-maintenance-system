import { useQuery } from "@tanstack/react-query";
import { httpClient, type ApiResponse } from "@/api/httpClient";

export interface HotspotItem {
  centerLatitude: number;
  centerLongitude: number;
  incidentCount: number;
  incidentIds: string[];
}

export interface ResponseTimeData {
  incidentCount: number;
  averageHours: number;
}

export interface BudgetOverviewData {
  emergencyCost: number;
  regularCost: number;
  totalCost: number;
}

export interface AnalyticsPeriodFilter {
  fromDate?: string;
  toDate?: string;
}

export interface HotspotFilter extends AnalyticsPeriodFilter {
  clusterRadiusMeters?: number;
  minimumIncidents?: number;
}

// --- API Functions ---

async function fetchHotspots(params?: HotspotFilter) {
  const res = await httpClient.get<ApiResponse<HotspotItem[]>>("/analytics/hotspots", { params });
  return res.data;
}

async function fetchResponseTime(params?: AnalyticsPeriodFilter) {
  const res = await httpClient.get<ApiResponse<ResponseTimeData>>("/analytics/response-time", { params });
  return res.data;
}

async function fetchBudgetOverview(params?: AnalyticsPeriodFilter) {
  const res = await httpClient.get<ApiResponse<BudgetOverviewData>>("/analytics/budget-overview", { params });
  return res.data;
}

// --- Hooks ---

export function useHotspotsQuery(params?: HotspotFilter) {
  return useQuery({
    queryKey: ["analytics", "hotspots", params],
    queryFn: () => fetchHotspots(params),
  });
}

export function useResponseTimeQuery(params?: AnalyticsPeriodFilter) {
  return useQuery({
    queryKey: ["analytics", "response-time", params],
    queryFn: () => fetchResponseTime(params),
  });
}

export function useBudgetOverviewQuery(params?: AnalyticsPeriodFilter) {
  return useQuery({
    queryKey: ["analytics", "budget-overview", params],
    queryFn: () => fetchBudgetOverview(params),
  });
}
