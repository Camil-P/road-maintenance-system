import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient, type ApiResponse } from "@/api/httpClient";

export type MachineType =
  | "SnowPlow"
  | "SaltSpreader"
  | "Excavator"
  | "Compactor"
  | "AsphaltPaver"
  | "TruckMixer"
  | "Crane"
  | "Other";

export interface MachineResponse {
  id: string;
  name: string;
  machineType: MachineType;
  machineTypeName: string;
  acquisitionYear: number;
  purchasePrice: number;
  usefulLifeYears: number;
  residualValue: number;
  registrationNumber?: string;
  notes?: string;
  isOperational: boolean;
  lastMaintenanceAt?: string;
}

export interface CreateMachinePayload {
  name: string;
  machineType: MachineType;
  acquisitionYear: number;
  purchasePrice: number;
  usefulLifeYears: number;
  residualValue: number;
  registrationNumber?: string;
  notes?: string;
}

export interface SetOperationalPayload {
  isOperational: boolean;
  reason?: string;
}

export interface RecordMaintenancePayload {
  notes: string;
}

// --- API Functions ---

async function fetchMachines() {
  const res = await httpClient.get<ApiResponse<MachineResponse[]>>("/machines");
  return res.data;
}

async function fetchMachineById(id: string) {
  const res = await httpClient.get<ApiResponse<MachineResponse>>(`/machines/${id}`);
  return res.data;
}

async function createMachineApi(payload: CreateMachinePayload) {
  const res = await httpClient.post<ApiResponse<MachineResponse>>("/machines", payload);
  return res.data;
}

async function updateMachineApi({ id, ...payload }: { id: string } & CreateMachinePayload) {
  const res = await httpClient.put<ApiResponse<MachineResponse>>(`/machines/${id}`, payload);
  return res.data;
}

async function setOperationalApi({ id, ...payload }: { id: string } & SetOperationalPayload) {
  const res = await httpClient.patch<ApiResponse<MachineResponse>>(`/machines/${id}/operational`, payload);
  return res.data;
}

async function recordMaintenanceApi({ id, ...payload }: { id: string } & RecordMaintenancePayload) {
  const res = await httpClient.patch<ApiResponse<MachineResponse>>(`/machines/${id}/maintenance`, payload);
  return res.data;
}

// --- Hooks ---

export function useMachinesQuery() {
  return useQuery({
    queryKey: ["machines"],
    queryFn: fetchMachines,
  });
}

export function useMachineByIdQuery(id: string) {
  return useQuery({
    queryKey: ["machines", id],
    queryFn: () => fetchMachineById(id),
    enabled: !!id,
  });
}

export function useCreateMachineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMachineApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    },
  });
}

export function useUpdateMachineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMachineApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    },
  });
}

export function useSetOperationalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setOperationalApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    },
  });
}

export function useRecordMaintenanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordMaintenanceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    },
  });
}
