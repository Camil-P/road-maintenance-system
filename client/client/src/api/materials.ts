import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient, type ApiResponse } from "@/api/httpClient";

export interface MaterialResponse {
  id: string;
  name: string;
  unit: string;
  currentQuantity: number;
  minimumThreshold: number;
  unitCost: number;
  totalValue: number;
  isBelowThreshold: boolean;
  lastUpdated: string;
}

export interface CreateMaterialPayload {
  name: string;
  unit: string;
  currentQuantity: number;
  minimumThreshold: number;
  unitCost: number;
}

export interface UpdateMaterialPayload {
  name: string;
  unit: string;
  minimumThreshold: number;
  unitCost: number;
}

export interface StockAdjustPayload {
  quantity: number;
  workOrderId?: string;
}

// --- API Functions ---

async function fetchMaterials() {
  const res = await httpClient.get<ApiResponse<MaterialResponse[]>>("/materials");
  return res.data;
}

async function fetchMaterialById(id: string) {
  const res = await httpClient.get<ApiResponse<MaterialResponse>>(`/materials/${id}`);
  return res.data;
}

async function createMaterialApi(payload: CreateMaterialPayload) {
  const res = await httpClient.post<ApiResponse<MaterialResponse>>("/materials", payload);
  return res.data;
}

async function updateMaterialApi({ id, ...payload }: { id: string } & UpdateMaterialPayload) {
  const res = await httpClient.put<ApiResponse<MaterialResponse>>(`/materials/${id}`, payload);
  return res.data;
}

async function addStockApi({ id, ...payload }: { id: string } & StockAdjustPayload) {
  const res = await httpClient.patch<ApiResponse<MaterialResponse>>(`/materials/${id}/stock/add`, payload);
  return res.data;
}

async function consumeStockApi({ id, ...payload }: { id: string } & StockAdjustPayload) {
  const res = await httpClient.patch<ApiResponse<MaterialResponse>>(`/materials/${id}/stock/consume`, payload);
  return res.data;
}

// --- Hooks ---

export function useMaterialsQuery() {
  return useQuery({
    queryKey: ["materials"],
    queryFn: fetchMaterials,
  });
}

export function useMaterialByIdQuery(id: string) {
  return useQuery({
    queryKey: ["materials", id],
    queryFn: () => fetchMaterialById(id),
    enabled: !!id,
  });
}

export function useCreateMaterialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMaterialApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useUpdateMaterialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMaterialApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useAddStockMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStockApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useConsumeStockMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: consumeStockApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    },
  });
}
