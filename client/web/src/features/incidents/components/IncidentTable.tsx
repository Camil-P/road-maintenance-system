// src/features/incidents/components/IncidentTable.tsx
import { useState } from "react";
import type { IncidentResponse } from "@/api/incidents";
import {
  useVerifyIncidentMutation,
  useResolveIncidentMutation,
  useMarkDuplicateMutation,
} from "@/api/incidents";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkOrderForm } from "@/features/workOrders/components/WorkOrderForm";
import { getCurrentUser } from "@/lib/auth";

interface Props {
  incidents: IncidentResponse[];
}

const STATUS_COLORS: Record<string, string> = {
  Reported: "bg-yellow-100 text-yellow-800",
  Verified: "bg-blue-100 text-blue-800",
  Resolved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Duplicate: "bg-gray-100 text-gray-700",
};

// Total number of columns in the table
const COL_SPAN = 7;

export function IncidentTable({ incidents }: Props) {
  const user = getCurrentUser();
  const role = user?.role || "";
  const canManage = ["Admin", "Dispatcher", "MaintenanceManager"].includes(role);

  const verifyMutation = useVerifyIncidentMutation();
  const resolveMutation = useResolveIncidentMutation();
  const markDuplicateMutation = useMarkDuplicateMutation();

  const [duplicateTarget, setDuplicateTarget] = useState<string | null>(null);
  const [duplicateInput, setDuplicateInput] = useState("");
  const [expandedWO, setExpandedWO] = useState<string | null>(null);

  const handleMarkDuplicate = (id: string) => {
    if (!duplicateInput.trim()) return;
    markDuplicateMutation.mutate(
      { id, relatedIncidentId: duplicateInput.trim() },
      { onSuccess: () => { setDuplicateTarget(null); setDuplicateInput(""); } }
    );
  };

  const toggleWOForm = (id: string) => {
    setExpandedWO((prev) => (prev === id ? null : id));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Tip</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Opis</TableHead>
          <TableHead>Dionica</TableHead>
          <TableHead>Prijavljeno</TableHead>
          <TableHead>Akcija</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidents.map((inc) => {
          const statusKey = inc.statusName || String(inc.status);
          const isReported = statusKey === "Reported";
          const isVerified = statusKey === "Verified";
          const woOpen = expandedWO === inc.id;

          return (
            <>
              <TableRow key={inc.id} className={woOpen ? "bg-slate-50" : undefined}>
                <TableCell className="text-xs font-mono max-w-20 truncate" title={inc.id}>
                  {inc.id.slice(0, 8)}…
                </TableCell>
                <TableCell>{inc.typeName || inc.type}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[statusKey] ?? "bg-slate-100 text-slate-700"}`}
                  >
                    {statusKey}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs truncate" title={inc.description}>
                  {inc.description}
                </TableCell>
                <TableCell className="text-xs">{inc.roadSegmentName ?? inc.roadSegmentId ?? "-"}</TableCell>
                <TableCell className="text-xs">
                  {new Date(inc.reportedAt).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 min-w-35">
                    {canManage && isReported && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-700 border-blue-300 h-7 text-xs"
                        disabled={verifyMutation.isPending}
                        onClick={() => verifyMutation.mutate(inc.id)}
                      >
                        Verifikuj
                      </Button>
                    )}
                    {canManage && isVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-300 h-7 text-xs"
                        disabled={resolveMutation.isPending}
                        onClick={() => resolveMutation.mutate(inc.id)}
                      >
                        Zatvori
                      </Button>
                    )}
                    {canManage && (isReported || isVerified) && (
                      <>
                        {duplicateTarget === inc.id ? (
                          <div className="flex gap-1">
                            <Input
                              className="h-7 text-xs w-28"
                              placeholder="ID duplikata"
                              value={duplicateInput}
                              onChange={(e) => setDuplicateInput(e.target.value)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              disabled={markDuplicateMutation.isPending}
                              onClick={() => handleMarkDuplicate(inc.id)}
                            >
                              OK
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => { setDuplicateTarget(null); setDuplicateInput(""); }}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (isVerified ??
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-slate-500"
                            onClick={() => setDuplicateTarget(inc.id)}
                          >
                            Duplikat
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      size="sm"
                      variant={woOpen ? "default" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => toggleWOForm(inc.id)}
                    >
                      {woOpen ? "Zatvori RN" : "Kreiraj RN"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {woOpen && (
                <TableRow key={`wo-form-${inc.id}`} className="bg-slate-50 hover:bg-slate-50">
                  <TableCell colSpan={COL_SPAN} className="px-6 py-4 border-b">
                    <div className="bg-white border rounded-md p-4 shadow-sm">
                      <p className="text-sm font-medium text-slate-700 mb-3">
                        Novi radni nalog za incident{" "}
                        <span className="font-mono text-xs text-slate-500">{inc.id.slice(0, 8)}…</span>
                      </p>
                      <WorkOrderForm
                        incidentId={inc.id}
                        layout="grid"
                        onClose={() => setExpandedWO(null)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
}
