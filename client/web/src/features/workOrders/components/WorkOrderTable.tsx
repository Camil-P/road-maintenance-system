import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useWorkOrdersQuery,
  useMyWorkOrdersQuery,
  useUpdateWorkOrderStatusMutation,
  type WorkOrder,
  type WorkOrderFilters,
} from "@/api/workOrders";
import { Loader2, Plus } from "lucide-react";
import { WorkOrderForm } from "./WorkOrderForm";
import { Pagination } from "@/components/ui/pagination";
import { getCurrentUser } from "@/lib/auth";

const STATUS_STYLES: Record<string, string> = {
  Created: "bg-slate-100 text-slate-700",
  InProgress: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const PRIORITY_LABELS: Record<string, string> = {
  "1": "Nizak",
  "2": "Srednji",
  "3": "Visok",
  "4": "Hitan",
};

const PRIORITY_STYLES: Record<string, string> = {
  "1": "bg-slate-100 text-slate-600",
  "2": "bg-yellow-100 text-yellow-800",
  "3": "bg-orange-100 text-orange-800",
  "4": "bg-red-100 text-red-800",
};

interface WorkOrderTableProps {
  assignedOnly?: boolean;
  filters?: WorkOrderFilters;
  onPageChange?: (page: number) => void;
}

export function WorkOrderTable({
  assignedOnly = false,
  filters,
  onPageChange,
}: WorkOrderTableProps) {
  const user = getCurrentUser();
  const role = user?.role ?? "";
  const canManage = ["Admin", "Dispatcher", "MaintenanceManager"].includes(role);

  const workOrdersResult = assignedOnly
    ? useMyWorkOrdersQuery(filters)
    : useWorkOrdersQuery(filters);

  const { data, isLoading } = workOrdersResult;
  const updateMutation = useUpdateWorkOrderStatusMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const items = data?.data?.items ?? [];
  const pagination = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleStatusChange = (id: string, status: WorkOrder["status"]) => {
    updateMutation.mutate({ id, status });
    setConfirmCancel(null);
  };

  return (
    <div className="space-y-4">
      {!assignedOnly && (
        <div className="flex justify-end">
          <Button onClick={() => setIsCreating(!isCreating)}>
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Otkaži" : "Novi radni nalog"}
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tip radova</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioritet</TableHead>
              <TableHead>Dionica</TableHead>
              <TableHead>Dodijeljeno</TableHead>
              <TableHead>Planirani datum</TableHead>
              <TableHead className="text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isCreating && !assignedOnly && (
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableCell colSpan={7} className="p-4 border-b">
                  <div className="bg-white p-4 rounded-md border shadow-sm">
                    <h3 className="text-base font-medium mb-4">Kreiraj novi radni nalog</h3>
                    <WorkOrderForm onClose={() => setIsCreating(false)} />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {items.map((order: WorkOrder) => {
              const statusKey = order.statusName || order.status;
              const priority = String(order.priority ?? "");

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.workTypeName}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[statusKey] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {statusKey}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                        PRIORITY_STYLES[priority] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {PRIORITY_LABELS[priority] ?? priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    {order.roadSegmentName
                      ? `${order.roadSegmentName}${order.roadSegmentCategory ? ` (${order.roadSegmentCategory})` : ""}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.assignedToUserId ?? "Nije dodijeljeno"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.scheduledDate
                      ? new Date(order.scheduledDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {order.status === "Created" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-blue-700 border-blue-300"
                          disabled={updateMutation.isPending}
                          onClick={() => handleStatusChange(order.id, "InProgress")}
                        >
                          Pokreni
                        </Button>
                      )}
                      {order.status === "InProgress" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-green-600 hover:bg-green-700"
                          disabled={updateMutation.isPending}
                          onClick={() => handleStatusChange(order.id, "Completed")}
                        >
                          Završi
                        </Button>
                      )}
                      {canManage &&
                        (order.status === "Created" || order.status === "InProgress") && (
                          <>
                            {confirmCancel === order.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-red-700 border-red-300"
                                  disabled={updateMutation.isPending}
                                  onClick={() => handleStatusChange(order.id, "Cancelled")}
                                >
                                  Potvrdi
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() => setConfirmCancel(null)}
                                >
                                  ✕
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-slate-500"
                                onClick={() => setConfirmCancel(order.id)}
                              >
                                Otkaži
                              </Button>
                            )}
                          </>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {items.length === 0 && !isCreating && (
        <div className="text-center py-10 text-sm text-slate-500">
          {assignedOnly
            ? "Nema radnih naloga dodijeljenih vama."
            : "Nema radnih naloga koji odgovaraju filteru."}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          onPageChange={(p) => onPageChange?.(p)}
        />
      )}
    </div>
  );
}
