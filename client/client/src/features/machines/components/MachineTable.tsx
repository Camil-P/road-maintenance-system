import { useState } from "react";
import type { MachineResponse } from "@/api/machines";
import { useSetOperationalMutation, useRecordMaintenanceMutation } from "@/api/machines";
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

interface Props {
  machines: MachineResponse[];
  onEdit: (machine: MachineResponse) => void;
}

export function MachineTable({ machines, onEdit }: Props) {
  const setOperationalMutation = useSetOperationalMutation();
  const maintenanceMutation = useRecordMaintenanceMutation();

  const [maintenanceTarget, setMaintenanceTarget] = useState<string | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [operationalReason, setOperationalReason] = useState<{ id: string; active: boolean; reason: string } | null>(null);

  const handleMaintenance = (id: string) => {
    maintenanceMutation.mutate(
      { id, notes: maintenanceNotes },
      { onSuccess: () => { setMaintenanceTarget(null); setMaintenanceNotes(""); } }
    );
  };

  const handleSetOperational = () => {
    if (!operationalReason) return;
    setOperationalMutation.mutate(
      { id: operationalReason.id, isOperational: operationalReason.active, reason: operationalReason.reason || undefined },
      { onSuccess: () => setOperationalReason(null) }
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Naziv</TableHead>
          <TableHead>Tip</TableHead>
          <TableHead>Reg. br.</TableHead>
          <TableHead>God. nabavke</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Posl. servis</TableHead>
          <TableHead>Akcija</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {machines.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="font-medium">{m.name}</TableCell>
            <TableCell>{m.machineTypeName || m.machineType}</TableCell>
            <TableCell>{m.registrationNumber ?? "-"}</TableCell>
            <TableCell>{m.acquisitionYear}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                  m.isOperational
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {m.isOperational ? "Operativna" : "Neoperativna"}
              </span>
            </TableCell>
            <TableCell className="text-xs">
              {m.lastMaintenanceAt
                ? new Date(m.lastMaintenanceAt).toLocaleDateString()
                : "-"}
            </TableCell>
            <TableCell>
              {operationalReason?.id === m.id ? (
                <div className="flex flex-col gap-1">
                  <Input
                    className="h-7 text-xs w-40"
                    placeholder="Razlog (opcionalno)"
                    value={operationalReason.reason}
                    onChange={(e) => setOperationalReason((p) => p ? { ...p, reason: e.target.value } : p)}
                  />
                  <div className="flex gap-1">
                    <Button size="sm" className="h-7 text-xs" disabled={setOperationalMutation.isPending} onClick={handleSetOperational}>
                      Potvrdi
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOperationalReason(null)}>
                      ✕
                    </Button>
                  </div>
                </div>
              ) : maintenanceTarget === m.id ? (
                <div className="flex flex-col gap-1">
                  <Input
                    className="h-7 text-xs w-40"
                    placeholder="Opis servisa"
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                  />
                  <div className="flex gap-1">
                    <Button size="sm" className="h-7 text-xs" disabled={maintenanceMutation.isPending} onClick={() => handleMaintenance(m.id)}>
                      Sačuvaj
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setMaintenanceTarget(null); setMaintenanceNotes(""); }}>
                      ✕
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-7 text-xs ${m.isOperational ? "text-red-700 border-red-300" : "text-green-700 border-green-300"}`}
                    onClick={() => setOperationalReason({ id: m.id, active: !m.isOperational, reason: "" })}
                  >
                    {m.isOperational ? "Deaktiviraj" : "Aktiviraj"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => setMaintenanceTarget(m.id)}
                  >
                    Servis
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => onEdit(m)}
                  >
                    Uredi
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
