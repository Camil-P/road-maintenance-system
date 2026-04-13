import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient, type ApiResponse } from "./httpClient";

export interface WorkZoneResponse {
  id: string;
  name: string;
  geometryJson: string;
  originalGeometryJson: string;
  originalLengthMeters: number;
  remainingLengthMeters: number;
  completedLengthMeters: number;
  progressPercent: number;
  affectedLane: string;
  affectedLaneName: string;
  status: string;
  statusName: string;
  createdAt: string;
  updatedAt: string;
  historyCount: number;
}

export interface WorkZoneHistoryItem {
  id: string;
  geometryJson: string;
  totalLengthMeters: number;
  completedMeters: number;
  note: string;
  createdAt: string;
}

export interface WorkZoneDetail extends WorkZoneResponse {
  history: WorkZoneHistoryItem[];
}

export const AffectedLaneValues = {
  Both: 1,
  LeftOnly: 2,
  RightOnly: 3,
} as const;

export interface CreateWorkZonePayload {
  name: string;
  geometryJson: string;
  lengthMeters: number;
  affectedLane: number;
}

export interface UpdateProgressPayload {
  newGeometryJson: string;
  newRemainingLengthMeters: number;
  note: string;
}

async function createWorkZone(payload: CreateWorkZonePayload) {
  const res = await httpClient.post<ApiResponse<WorkZoneResponse>>("/workzones", payload);
  return res.data;
}

async function fetchWorkZones() {
  const res = await httpClient.get<ApiResponse<WorkZoneResponse[]>>("/workzones");
  return res.data;
}

async function fetchWorkZoneById(id: string) {
  const res = await httpClient.get<ApiResponse<WorkZoneDetail>>(`/workzones/${id}`);
  return res.data;
}

async function updateProgress({ id, ...payload }: UpdateProgressPayload & { id: string }) {
  const res = await httpClient.patch<ApiResponse<WorkZoneResponse>>(`/workzones/${id}/progress`, payload);
  return res.data;
}

async function completeWorkZone({ id, note }: { id: string; note: string }) {
  const res = await httpClient.patch<ApiResponse<null>>(`/workzones/${id}/complete`, { note });
  return res.data;
}

export function useWorkZonesQuery() {
  return useQuery({
    queryKey: ["workZones"],
    queryFn: fetchWorkZones,
  });
}

export function useWorkZoneByIdQuery(id: string) {
  return useQuery({
    queryKey: ["workZones", id],
    queryFn: () => fetchWorkZoneById(id),
    enabled: !!id,
  });
}

export function useCreateWorkZoneMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorkZone,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workZones"] });
      qc.invalidateQueries({ queryKey: ["map"] });
    },
  });
}

export function useUpdateWorkZoneProgressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProgress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workZones"] });
      qc.invalidateQueries({ queryKey: ["map"] });
    },
  });
}

export function useCompleteWorkZoneMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeWorkZone,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workZones"] });
      qc.invalidateQueries({ queryKey: ["map"] });
    },
  });
}
