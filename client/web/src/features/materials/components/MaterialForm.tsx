import { useState } from "react";
import type { MaterialResponse, CreateMaterialPayload } from "@/api/materials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  initial?: MaterialResponse;
  onSubmit: (data: CreateMaterialPayload) => void;
  isPending?: boolean;
  onCancel: () => void;
}

export function MaterialForm({ initial, onSubmit, isPending, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [currentQuantity, setCurrentQuantity] = useState(initial?.currentQuantity ?? 0);
  const [minimumThreshold, setMinimumThreshold] = useState(initial?.minimumThreshold ?? 0);
  const [unitCost, setUnitCost] = useState(initial?.unitCost ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, unit, currentQuantity, minimumThreshold, unitCost });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 col-span-2">
          <Label>Naziv</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Jedinica mjere</Label>
          <Input required value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="npr. tone, litri" />
        </div>
        <div className="space-y-1">
          <Label>Cijena po jedinici (€)</Label>
          <Input
            type="number"
            required
            min={0}
            step="0.01"
            value={unitCost}
            onChange={(e) => setUnitCost(Number(e.target.value))}
          />
        </div>
        {!initial && (
          <div className="space-y-1">
            <Label>Početna količina</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={currentQuantity}
              onChange={(e) => setCurrentQuantity(Number(e.target.value))}
            />
          </div>
        )}
        <div className="space-y-1">
          <Label>Minimalni prag</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={minimumThreshold}
            onChange={(e) => setMinimumThreshold(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Čuvanje..." : initial ? "Sačuvaj izmjene" : "Dodaj materijal"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Odustani
        </Button>
      </div>
    </form>
  );
}
