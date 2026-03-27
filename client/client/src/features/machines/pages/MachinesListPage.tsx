import { useState } from "react";
import {
  useMachinesQuery,
  useCreateMachineMutation,
  useUpdateMachineMutation,
  type MachineResponse,
  type CreateMachinePayload,
} from "@/api/machines";
import { MachineTable } from "../components/MachineTable";
import { MachineForm } from "../components/MachineForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MachinesListPage() {
  const { data, isLoading, isError } = useMachinesQuery();
  const createMutation = useCreateMachineMutation();
  const updateMutation = useUpdateMachineMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<MachineResponse | null>(null);

  const machines = data?.data ?? [];

  const handleCreate = (payload: CreateMachinePayload) => {
    createMutation.mutate(payload, { onSuccess: () => setShowCreate(false) });
  };

  const handleUpdate = (payload: CreateMachinePayload) => {
    if (!editTarget) return;
    updateMutation.mutate(
      { id: editTarget.id, ...payload },
      { onSuccess: () => setEditTarget(null) }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mašine i vozila</h1>
        {!showCreate && !editTarget && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            + Nova mašina
          </Button>
        )}
      </div>

      {(showCreate || editTarget) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editTarget ? `Uredi: ${editTarget.name}` : "Nova mašina"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MachineForm
              initial={editTarget ?? undefined}
              onSubmit={editTarget ? handleUpdate : handleCreate}
              isPending={createMutation.isPending || updateMutation.isPending}
              onCancel={() => { setShowCreate(false); setEditTarget(null); }}
            />
          </CardContent>
        </Card>
      )}

      {isLoading && <p>Učitavanje mašina...</p>}
      {isError && <p className="text-red-600">Greška pri učitavanju mašina.</p>}

      {machines.length > 0 && (
        <MachineTable machines={machines} onEdit={setEditTarget} />
      )}
      {!isLoading && machines.length === 0 && (
        <p className="text-slate-500 text-sm">Nema unesenih mašina.</p>
      )}
    </div>
  );
}
