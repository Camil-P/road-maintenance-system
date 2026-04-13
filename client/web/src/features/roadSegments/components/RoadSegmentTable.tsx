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
  useRoadSegmentsQuery,
  useUpdateRoadSegmentStatusMutation,
  type RoadSegment,
  type RoadStatus,
} from "@/api/roadSegments";
import { Loader2, Plus, Pencil } from "lucide-react";
import { RoadSegmentForm } from "./RoadSegmentForm";

const allStatuses: { value: RoadStatus; label: string }[] = [
  { value: "Open", label: "Otvoreno" },
  { value: "UnderMaintenance", label: "U održavanju" },
  { value: "Closed", label: "Zatvoreno" },
  { value: "Dangerous", label: "Opasno" }
];

export function RoadSegmentTable() {
  const { data, isLoading } = useRoadSegmentsQuery();
  const statusMutation = useUpdateRoadSegmentStatusMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const segments = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Putna mreža</h2>
        <Button onClick={() => { setIsCreating(!isCreating); setEditingId(null); }}>
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Otkaži" : "Nova dionica"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naziv</TableHead>
              <TableHead>Kategorija</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dužina (km)</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead className="text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isCreating && (
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableCell colSpan={6} className="p-4 border-b">
                  <div className="bg-white p-4 rounded-md border shadow-sm">
                    <h3 className="text-lg font-medium mb-4">Dodaj novu dionicu</h3>
                    <RoadSegmentForm onClose={() => setIsCreating(false)} />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {segments.map((segment: RoadSegment) => (
              <>
                <TableRow key={segment.id}>
                  <TableCell className="font-medium">{segment.name}</TableCell>
                  <TableCell>{segment.categoryName}</TableCell>
                  <TableCell>
                    <select
                      value={segment.status}
                      onChange={(e) =>
                        statusMutation.mutate({ id: segment.id, status: e.target.value as RoadStatus })
                      }
                      disabled={statusMutation.isPending}
                      className="text-sm rounded-md border border-slate-300 bg-transparent px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:opacity-50"
                    >
                      {allStatuses.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>{segment.length}</TableCell>
                  <TableCell className="max-w-xs truncate text-slate-500">
                    {segment.description || "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(editingId === segment.id ? null : segment.id);
                        setIsCreating(false);
                      }}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Uredi
                    </Button>
                  </TableCell>
                </TableRow>

                {editingId === segment.id && (
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableCell colSpan={6} className="p-4 border-b">
                      <div className="bg-white p-4 rounded-md border shadow-sm">
                        <h3 className="text-lg font-medium mb-4">Uredi dionicu</h3>
                        <RoadSegmentForm
                          segment={segment}
                          onClose={() => setEditingId(null)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {segments.length === 0 && !isCreating && (
        <div className="text-center py-12 text-sm text-slate-500">
          Nema dionica. Dodajte prvu dionicu.
        </div>
      )}
    </div>
  );
}
