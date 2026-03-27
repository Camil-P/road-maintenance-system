import { useState } from "react";
import { WorkOrderTable } from "../components/WorkOrderTable";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { WorkOrderFilters } from "@/api/workOrders";

const STATUSES = ["", "Created", "InProgress", "Completed", "Cancelled"];

const STATUS_LABELS: Record<string, string> = {
  "": "Svi statusi",
  Created: "Kreiran",
  InProgress: "U toku",
  Completed: "Završen",
  Cancelled: "Otkazan",
};

export function WorkOrdersListPage() {
  const [filters, setFilters] = useState<WorkOrderFilters>({ page: 1, pageSize: 20 });

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => setFilters({ page: 1, pageSize: 20 });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Svi radni nalozi</h1>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Status</label>
          <Select
            value={filters.status ?? ""}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s || "any"} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
        >
          Ukloni filtere
        </Button>
      </div>

      <WorkOrderTable
        filters={filters}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}
