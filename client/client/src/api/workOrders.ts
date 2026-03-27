import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient, type ApiResponse, type PaginatedResponse } from "@/api/httpClient";
import { getCurrentUser } from "@/lib/auth";

export type WorkOrderStatus = "Created" | "InProgress" | "Completed" | "Cancelled";
export type WorkType = 
  | "PotholeRepair"
  | "LineRepainting"
  | "SnowRemoval"
  | "Salting"
  | "TrafficLightRepair"
  | "SignReplacement"
  | "GuardrailRepair"
  | "DebrisRemoval"
  | "DrainageWork"
  | "SurfaceRepair"
  | "Other";

export interface WorkOrder {
  id: string;
  incidentId?: string;
  roadSegmentId?: string;
  roadSegmentName?: string;
  roadSegmentCategory?: string;
  workType: WorkType;
  workTypeName: string; 
  status: WorkOrderStatus;
  statusName: string;
  priority?: string;
  assignedToUserId?: string;
  scheduledDate?: string;
  createdAt: string;
}

export interface CreateWorkOrderPayload {
  incidentId?: string;
  roadSegmentId?: string;
  workType: WorkType;
  scheduledDate?: string;
  description: string;
  priority: number; 
}

export interface WorkOrderFilters {
  status?: string;
  roadSegmentId?: string;
  assignedToUserId?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchWorkOrders(filters?: { status?: string; roadSegmentId?: string; assignedToUserId?: string }) {
  const params = new URLSearchParams(filters as any);
  const res = await httpClient.get<ApiResponse<PaginatedResponse<WorkOrder>>>(`/workorders?${params}`);
    return res.data;
}

export async function fetchMyWorkOrders(filters?: Pick<WorkOrderFilters, 'page' | 'pageSize'>) {
  const params = new URLSearchParams(filters as any);
  const res = await httpClient.get<ApiResponse<PaginatedResponse<WorkOrder>>>(`/workorders/my?${params}`);
    return res.data;
}

export async function createWorkOrder(payload: CreateWorkOrderPayload) {
  const res = await httpClient.post<ApiResponse<WorkOrder>>("/workorders", payload);
    return res.data;
}

export async function updateWorkOrderStatus({ id, status }: { id: string; status: WorkOrderStatus }) {
  const res = await httpClient.patch<ApiResponse<WorkOrder>>(`/workorders/${id}/status`, { status });
    return res.data;
}

export function useWorkOrdersQuery(filters?: WorkOrderFilters) {
  return useQuery({
    queryKey: ["workOrders", filters],
    queryFn: () => fetchWorkOrders(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyWorkOrdersQuery(filters?: Pick<WorkOrderFilters, 'page' | 'pageSize'>) {
  const user = getCurrentUser();
  return useQuery({
    queryKey: ["myWorkOrders", filters],
    queryFn: () => fetchMyWorkOrders(filters),
    enabled: !!user,
  });
}

export function useCreateWorkOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["myWorkOrders"] }); // Ensure personal list refreshes
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

export function useUpdateWorkOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWorkOrderStatus,
    onSuccess: (_updatedWorkOrder, variables) => {
      // Invalidate to be safe across filtered variations
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["myWorkOrders"] });

      // Optimistic/Cache update adjusted for the new paginated shape
      queryClient.setQueryData(["workOrders"], (old?: PaginatedResponse<WorkOrder>) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((wo) => 
            wo.id === variables.id ? { ...wo, status: variables.status, statusName: variables.status } : wo
          )
        };
      });
    },
  });
}
