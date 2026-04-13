import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient, type ApiResponse, type PaginatedResponse } from "@/api/httpClient";

export type IncidentStatus = "Reported" | "Verified" | "Rejected" | "Resolved" | number;
export type IncidentType = string | number;

// Maps to IncidentResponse in IncidentContracts.cs
export interface IncidentResponse {
  id: string;
  type: IncidentType;
  typeName: string;
  status: IncidentStatus;
  statusName: string;
  description: string;
  latitude?: number;
  longitude?: number;
  locationDescription: string;
  roadSegmentId?: string;
  roadSegmentName?: string;
  reportedByUserId: string;
  reportedAt: string;
  verifiedAt?: string;
  resolvedAt?: string;
  hasPotentialDuplicates: boolean;
  potentialDuplicateIds?: string[];
}

// Maps to GetIncidentsQuery in IncidentContracts.cs
export interface GetIncidentsQuery {
  status?: IncidentStatus;
  type?: IncidentType;
  roadSegmentId?: string;
  fromDate?: string;
  toDate?: string;
  reportedByUserId?: string;
  page?: number;
  pageSize?: number;
}

// Maps to CreateIncidentRequest in IncidentContracts.cs
export interface CreateIncidentRequest {
  type: IncidentType;
  description: string;
  latitude?: number;
  longitude?: number;
  locationDescription?: string;
  roadSegmentId?: string;
  geometryJson?: string;
}

// --- API Functions ---

// Note: Assuming `httpClient` unwraps the HTTP response (e.g., Axios response), 
// `res.data` will contain your backend's `ApiResponse<T>`.

async function fetchMyIncidents(query?: GetIncidentsQuery) {
  const res = await httpClient.get<ApiResponse<PaginatedResponse<IncidentResponse>>>("/Incidents/my", { params: query });
  return res.data;
}

async function fetchIncidents(query?: GetIncidentsQuery) {
  const res = await httpClient.get<ApiResponse<PaginatedResponse<IncidentResponse>>>("/Incidents", { params: query });
  return res.data;
}

async function getIncidentByIdApi(id: string) {
  const res = await httpClient.get<ApiResponse<IncidentResponse>>(`/Incidents/${id}`);
  return res.data;
}

async function createIncidentApi(payload: CreateIncidentRequest) {
  const res = await httpClient.post<ApiResponse<IncidentResponse>>("/Incidents", payload);
  return res.data;
}

async function verifyIncidentApi(id: string) {
  const res = await httpClient.patch<ApiResponse<IncidentResponse>>(`/incidents/${id}/verify`, {});
  return res.data;
}

export function useMyIncidentsQuery(query?: GetIncidentsQuery) {
  return useQuery({
    // Include the query object in the key so different pages/filters cache separately
    queryKey: ["incidents", "my", query],
    queryFn: () => fetchMyIncidents(query),
  });
}

export function useIncidentsQuery(query?: GetIncidentsQuery) {
  return useQuery({
    queryKey: ["incidents", query],
    queryFn: () => fetchIncidents(query),
  });
}

// Added this hook to match the GET /api/Incidents/{id} endpoint
export function useIncidentByIdQuery(id: string) {
  return useQuery({
    queryKey: ["incidents", id],
    queryFn: () => getIncidentByIdApi(id),
    enabled: !!id, // Prevent the query from running if the ID is missing
  });
}

export function useCreateIncidentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createIncidentApi,
    onSuccess: () => {
      // This single invalidation covers ["incidents"], ["incidents", "my"], 
      // and ["incidents", query] because it matches the prefix.
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

async function resolveIncidentApi(id: string) {
  const res = await httpClient.patch<ApiResponse<IncidentResponse>>(`/incidents/${id}/resolve`, {});
  return res.data;
}

async function markDuplicateApi({ id, relatedIncidentId }: { id: string; relatedIncidentId: string }) {
  const res = await httpClient.patch<ApiResponse<IncidentResponse>>(`/incidents/${id}/mark-duplicate/${relatedIncidentId}`, {});
  return res.data;
}

export function useVerifyIncidentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyIncidentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

export function useResolveIncidentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveIncidentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

export function useMarkDuplicateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markDuplicateApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}
