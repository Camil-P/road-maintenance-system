// src/features/incidents/pages/MyIncidentsPage.tsx
import { useState } from "react";
import { type GetIncidentsQuery, useMyIncidentsQuery } from "@/api/incidents";
import { IncidentTable } from "../components/IncidentTable";
import { Pagination } from "@/components/ui/pagination";

export function MyIncidentsPage() {
  // Initialize pagination state to page 1
  const [query, setQuery] = useState<GetIncidentsQuery>({ page: 1, pageSize: 20 });
  const { data, isLoading, isError } = useMyIncidentsQuery(query);

  // Extract items and pagination metadata
  const incidents = data?.data?.items ?? [];
  const paginationData = data?.data;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Moje prijave</h1>

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
                setQuery((prev) => ({ ...prev, page: newPage }))
              }
            />
          )}
        </div>
      )}
    </div>
  );
}