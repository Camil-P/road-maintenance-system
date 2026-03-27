import { useState } from "react";
import {
  useMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  type MaterialResponse,
  type CreateMaterialPayload,
  type UpdateMaterialPayload,
} from "@/api/materials";
import { MaterialTable } from "../components/MaterialTable";
import { MaterialForm } from "../components/MaterialForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialsListPage() {
  const { data, isLoading, isError } = useMaterialsQuery();
  const createMutation = useCreateMaterialMutation();
  const updateMutation = useUpdateMaterialMutation();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<MaterialResponse | null>(null);

  const materials = data?.data ?? [];

  const handleCreate = (payload: CreateMaterialPayload) => {
    createMutation.mutate(payload, { onSuccess: () => setShowCreate(false) });
  };

  const handleUpdate = (payload: CreateMaterialPayload) => {
    if (!editTarget) return;
    const updatePayload: UpdateMaterialPayload = {
      name: payload.name,
      unit: payload.unit,
      minimumThreshold: payload.minimumThreshold,
      unitCost: payload.unitCost,
    };
    updateMutation.mutate(
      { id: editTarget.id, ...updatePayload },
      { onSuccess: () => setEditTarget(null) }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Materijali</h1>
        {!showCreate && !editTarget && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            + Novi materijal
          </Button>
        )}
      </div>

      {(showCreate || editTarget) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editTarget ? `Uredi: ${editTarget.name}` : "Novi materijal"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MaterialForm
              initial={editTarget ?? undefined}
              onSubmit={editTarget ? handleUpdate : handleCreate}
              isPending={createMutation.isPending || updateMutation.isPending}
              onCancel={() => { setShowCreate(false); setEditTarget(null); }}
            />
          </CardContent>
        </Card>
      )}

      {isLoading && <p>Učitavanje materijala...</p>}
      {isError && <p className="text-red-600">Greška pri učitavanju materijala.</p>}

      {materials.length > 0 && (
        <MaterialTable materials={materials} onEdit={setEditTarget} />
      )}
      {!isLoading && materials.length === 0 && (
        <p className="text-slate-500 text-sm">Nema unesenih materijala.</p>
      )}
    </div>
  );
}
