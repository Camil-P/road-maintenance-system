import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient, type ApiResponse, type PaginatedResponse } from "@/api/httpClient";

// Enums mapped to string unions for frontend strictness
export type RoadCategory = "Highway" | "MainRoad" | "LocalRoad";
export type RoadStatus = "Open" | "UnderMaintenance" | "Closed" | "Dangerous";

export interface RoadSegment {
  id: string;
  name: string;
  category: RoadCategory;
  categoryName: string;
  status: RoadStatus;
  statusName: string;
  length: number; // Maps to Length from Response DTO
  description?: string;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  createdAt: string;
}

export interface RoadSegmentFilters {
  status?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

// Interfaces for mutation payloads (matching the backend Request DTOs)
export interface CreateRoadSegmentPayload {
  name: string;
  category: RoadCategory;
  lengthKm: number; // Backend DTO expects LengthKm for creation
  description?: string;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
}

export interface UpdateRoadSegmentPayload {
  name: string;
  category: RoadCategory;
  lengthKm: number;
  description?: string;
}

// --- API Calls ---

export async function fetchRoadSegments(filters?: RoadSegmentFilters) {
  const params = new URLSearchParams(filters as any);
  const res = await httpClient.get<ApiResponse<PaginatedResponse<RoadSegment>>>(`/roadsegments?${params}`);
  return res.data.data;
}

export async function fetchRoadSegmentById(id: string) {
  const res = await httpClient.get<ApiResponse<RoadSegment>>(`/roadsegments/${id}`);
  return res.data.data;
}

export async function createRoadSegment(payload: CreateRoadSegmentPayload) {
  const res = await httpClient.post<ApiResponse<RoadSegment>>("/roadsegments", payload);
  return res.data.data;
}

export async function updateRoadSegment({ id, payload }: { id: string; payload: UpdateRoadSegmentPayload }) {
  const res = await httpClient.put<ApiResponse<RoadSegment>>(`/roadsegments/${id}`, payload);
  return res.data.data;
}

export async function updateRoadSegmentStatus({ id, status }: { id: string; status: RoadStatus }) {
  const res = await httpClient.patch<ApiResponse<RoadSegment>>(`/roadsegments/${id}/status`, { status });
  return res.data.data;
}

// --- React Query Hooks ---

export function useRoadSegmentsQuery(filters?: RoadSegmentFilters) {
  return useQuery({
    queryKey: ["roadSegments", filters],
    queryFn: () => fetchRoadSegments(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useRoadSegmentByIdQuery(id: string) {
  return useQuery({
    queryKey: ["roadSegments", id],
    queryFn: () => fetchRoadSegmentById(id),
    enabled: !!id,
  });
}

export function useCreateRoadSegmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoadSegment,
    onSuccess: () => {
      // Invalidate the list to refetch with the new segment
      queryClient.invalidateQueries({ queryKey: ["roadSegments"] });
    },
  });
}

export function useUpdateRoadSegmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRoadSegment,
    onSuccess: (updatedSegment) => {
      // Invalidate lists to show updated data
      queryClient.invalidateQueries({ queryKey: ["roadSegments"] });
      // Update the specific item cache directly so the detail page updates instantly
      queryClient.setQueryData(["roadSegments", updatedSegment.id], updatedSegment);
    },
  });
}

export function useUpdateRoadSegmentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRoadSegmentStatus,
    onSuccess: (updatedSegment, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roadSegments"] });
      queryClient.setQueryData(["roadSegments", variables.id], updatedSegment);
    },
  });
}