import { useState } from "react";
import { useCreateWorkOrderMutation } from "@/api/workOrders";
import { useRoadSegmentsQuery } from "@/api/roadSegments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type WorkType =
  | "PotholeRepair"
  | "LineRepainting"
  | "SnowRemoval"
  | "Salting"
  | "TrafficLightRepair"
  | "SignReplacement"
  | "GuardrailRepair"
  | "DebrisRemoval"
  | "DrainageWork"
  | "SurfaceRepair"
  | "Other";

interface WorkOrderFormProps {
  incidentId?: string;
  onClose: () => void;
  /** "vertical" (default) stacks inputs; "grid" lays them out 3-per-row */
  layout?: "vertical" | "grid";
}

const FIELD_CLASS =
  "flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function WorkOrderForm({ incidentId, onClose, layout = "vertical" }: WorkOrderFormProps) {
  const createMutation = useCreateWorkOrderMutation();
  const { data: roadSegments } = useRoadSegmentsQuery();
  const [formData, setFormData] = useState<{
    workType: WorkType | "";
    roadSegmentId: string;
    scheduledDate: string;
    description: string;
    priority: number;
  }>({
    workType: "",
    roadSegmentId: "",
    scheduledDate: "",
    description: "",
    priority: 2,
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.workType) return;
    createMutation.mutate(
      {
        incidentId,
        workType: formData.workType,
        roadSegmentId: formData.roadSegmentId || undefined,
        scheduledDate: formData.scheduledDate || undefined,
        description: formData.description,
        priority: formData.priority,
      } as any,
      { onSuccess: onClose }
    );
  };

  const fields = (
    <>
      {/* Tip radova */}
      <div className="space-y-1">
        <Label htmlFor="workType">Tip radova *</Label>
        <select
          id="workType"
          value={formData.workType}
          onChange={(e) => setFormData({ ...formData, workType: e.target.value as WorkType })}
          className={FIELD_CLASS}
          required
        >
          <option value="">Odaberi tip...</option>
          <option value="PotholeRepair">Krpljenje udarnih rupa</option>
          <option value="LineRepainting">Iscrtavanje linija</option>
          <option value="SnowRemoval">Čišćenje snijega</option>
          <option value="Salting">Posipanje soli</option>
          <option value="TrafficLightRepair">Popravka semafora</option>
          <option value="SignReplacement">Zamjena znakova</option>
          <option value="GuardrailRepair">Popravka bankina</option>
          <option value="DebrisRemoval">Uklanjanje prepreka</option>
          <option value="DrainageWork">Sanacija odvoda</option>
          <option value="SurfaceRepair">Popravka kolovoza</option>
          <option value="Other">Ostalo</option>
        </select>
      </div>

      {/* Prioritet */}
      <div className="space-y-1">
        <Label htmlFor="priority">Prioritet *</Label>
        <select
          id="priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
          className={FIELD_CLASS}
          required
        >
          <option value={1}>1 - Nizak</option>
          <option value={2}>2 - Srednji</option>
          <option value={3}>3 - Visok</option>
          <option value={4}>4 - Hitan</option>
        </select>
      </div>

      {/* Planirani datum */}
      <div className="space-y-1">
        <Label htmlFor="scheduledDate">Planirani datum</Label>
        <Input
          id="scheduledDate"
          type="date"
          value={formData.scheduledDate}
          onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
        />
      </div>

      {/* Dionica */}
      <div className="space-y-1">
        <Label htmlFor="roadSegment">Dionica</Label>
        <select
          id="roadSegment"
          value={formData.roadSegmentId}
          onChange={(e) => setFormData({ ...formData, roadSegmentId: e.target.value })}
          className={FIELD_CLASS}
        >
          <option value="">Bez dionice</option>
          {roadSegments?.items.map((seg) => (
            <option key={seg.id} value={seg.id}>
              {seg.name} ({seg.category})
            </option>
          ))}
        </select>
      </div>

      {/* Opis */}
      <div className="space-y-1">
        <Label htmlFor="description">Opis radova</Label>
        <Input
          id="description"
          type="text"
          placeholder="Unesite dodatni opis..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
    </>
  );

  if (layout === "grid") {
    return (
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          {fields}
        </div>
        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={createMutation.isPending || !formData.workType}>
            {createMutation.isPending ? "Kreiranje..." : "Kreiraj radni nalog"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Otkaži
          </Button>
        </div>
        {createMutation.isError && (
          <p className="text-sm text-red-600 mt-2">
            {createMutation.error?.message || "Greška pri kreiranju radnog naloga"}
          </p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      {fields}
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={createMutation.isPending || !formData.workType}>
          {createMutation.isPending ? "Kreiranje..." : "Kreiraj radni nalog"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
          Otkaži
        </Button>
      </div>
      {createMutation.isError && (
        <p className="text-sm text-red-600">
          {createMutation.error?.message || "Greška pri kreiranju radnog naloga"}
        </p>
      )}
    </form>
  );
}
