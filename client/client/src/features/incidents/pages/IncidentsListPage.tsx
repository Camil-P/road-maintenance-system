// src/features/incidents/pages/IncidentsListPage.tsx
import { useState } from "react";
import {
  type GetIncidentsQuery,
  useIncidentsQuery,
} from "@/api/incidents";
import { IncidentTable } from "../components/IncidentTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";

const INCIDENT_STATUSES = ["", "Reported", "Verified", "Resolved"];

export function IncidentsListPage() {
  // Initialize with page 1
  const [filters, setFilters] = useState<GetIncidentsQuery>({ page: 1, pageSize: 20 });
  const { data, isLoading, isError } = useIncidentsQuery(filters);

  const incidents = data?.data?.items ?? [];
  const paginationData = data?.data;
console.log("paginationData", { paginationData });
  // Helper function to update filters and reset page to 1
  const handleFilterChange = (key: keyof GetIncidentsQuery, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Always reset to page 1 on new filter
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sve prijave</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Status</label>
          <Select
            value={(filters.status as string) ?? ""}
            onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
          >
            {INCIDENT_STATUSES.map((s) => (
              <option key={s || "any"} value={s}>
                {s || "Svi"}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Tip</label>
          <Input
            value={(filters.type as string) ?? ""}
            onChange={(e) => handleFilterChange("type", e.target.value || undefined)}
            placeholder="npr. Rupa na putu"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">ID dionice</label>
          <Input
            value={filters.roadSegmentId ?? ""}
            onChange={(e) => handleFilterChange("roadSegmentId", e.target.value || undefined)}
            placeholder="opcionalno"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setFilters({ page: 1, pageSize: 20 })}
          className="ml-auto"
          size="sm"
        >
          Ukloni filtere
        </Button>
      </div>

      {isLoading && <p>Učitavanje prijava...</p>}
      {isError && <p className="text-red-600">Greška pri učitavanju prijava.</p>}

      {data && (
        <div className="space-y-4">
          <IncidentTable incidents={incidents} />
          
          {/* Render pagination if we have metadata */}
          {paginationData && (
            <Pagination
              page={paginationData.page}
              totalPages={paginationData.totalPages}
              hasNextPage={paginationData.hasNextPage}
              hasPreviousPage={paginationData.hasPreviousPage}
              onPageChange={(newPage) => 
                setFilters((prev) => ({ ...prev, page: newPage }))
              }
            />
          )}
        </div>
      )}
    </div>
  );
}