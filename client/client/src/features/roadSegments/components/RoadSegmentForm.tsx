import { useState } from "react";
import {
  useCreateRoadSegmentMutation,
  useUpdateRoadSegmentMutation,
  type RoadSegment,
  type RoadCategory,
} from "@/api/roadSegments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RoadSegmentFormProps {
  segment?: RoadSegment;
  onClose: () => void;
}

type FormData = {
  name: string;
  category: RoadCategory | "";
  lengthKm: string;
  description: string;
};

export function RoadSegmentForm({ segment, onClose }: RoadSegmentFormProps) {
  const createMutation = useCreateRoadSegmentMutation();
  const updateMutation = useUpdateRoadSegmentMutation();
  const isEditing = !!segment;

  const [formData, setFormData] = useState<FormData>({
    name: segment?.name ?? "",
    category: segment?.category ?? "",
    lengthKm: segment?.length?.toString() ?? "",
    description: segment?.description ?? "",
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.category) return;

    const payload = {
      name: formData.name,
      category: formData.category as RoadCategory,
      lengthKm: parseFloat(formData.lengthKm),
      description: formData.description || undefined,
    };

    if (isEditing) {
      updateMutation.mutate({ id: segment.id, payload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  const selectClass =
    "flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Naziv *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="npr. Ulica oslobođenja"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Kategorija *</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as RoadCategory })}
            className={selectClass}
            required
          >
            <option value="">Odaberi kategoriju...</option>
            <option value="Highway">Autoput</option>
            <option value="MainRoad">Glavna cesta</option>
            <option value="LocalRoad">Lokalna cesta</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lengthKm">Dužina (km) *</Label>
          <Input
            id="lengthKm"
            type="number"
            step="0.01"
            min="0"
            value={formData.lengthKm}
            onChange={(e) => setFormData({ ...formData, lengthKm: e.target.value })}
            placeholder="npr. 5.2"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Opis</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Opcionalni opis"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? (isEditing ? "Čuvanje..." : "Kreiranje...") : isEditing ? "Sačuvaj izmjene" : "Dodaj dionicu"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
          Otkaži
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error?.message || "Došlo je do greške"}</p>
      )}
    </form>
  );
}
