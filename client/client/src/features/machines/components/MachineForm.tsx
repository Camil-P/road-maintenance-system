import { useState } from "react";
import type { MachineResponse, CreateMachinePayload, MachineType } from "@/api/machines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const MACHINE_TYPES: { value: MachineType; label: string }[] = [
  { value: "SnowPlow", label: "Snijegočistač" },
  { value: "SaltSpreader", label: "Rasipač soli" },
  { value: "Excavator", label: "Bager" },
  { value: "Compactor", label: "Valjak" },
  { value: "AsphaltPaver", label: "Asfaltna finišer" },
  { value: "TruckMixer", label: "Kamion mješalica" },
  { value: "Crane", label: "Dizalica" },
  { value: "Other", label: "Ostalo" },
];

interface Props {
  initial?: MachineResponse;
  onSubmit: (data: CreateMachinePayload) => void;
  isPending?: boolean;
  onCancel: () => void;
}

export function MachineForm({ initial, onSubmit, isPending, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [machineType, setMachineType] = useState<MachineType>(initial?.machineType ?? "Other");
  const [acquisitionYear, setAcquisitionYear] = useState(initial?.acquisitionYear ?? new Date().getFullYear());
  const [purchasePrice, setPurchasePrice] = useState(initial?.purchasePrice ?? 0);
  const [usefulLifeYears, setUsefulLifeYears] = useState(initial?.usefulLifeYears ?? 10);
  const [residualValue, setResidualValue] = useState(initial?.residualValue ?? 0);
  const [registrationNumber, setRegistrationNumber] = useState(initial?.registrationNumber ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      machineType,
      acquisitionYear,
      purchasePrice,
      usefulLifeYears,
      residualValue,
      registrationNumber: registrationNumber || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 col-span-2">
          <Label>Naziv</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Tip mašine</Label>
          <Select value={machineType} onChange={(e) => setMachineType(e.target.value as MachineType)}>
            {MACHINE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Registarski broj</Label>
          <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Godina nabavke</Label>
          <Input
            type="number"
            required
            min={1900}
            max={new Date().getFullYear()}
            value={acquisitionYear}
            onChange={(e) => setAcquisitionYear(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label>Nabavna cijena (€)</Label>
          <Input
            type="number"
            required
            min={0}
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label>Vijek trajanja (god.)</Label>
          <Input
            type="number"
            required
            min={1}
            value={usefulLifeYears}
            onChange={(e) => setUsefulLifeYears(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label>Ostatna vrijednost (€)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={residualValue}
            onChange={(e) => setResidualValue(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1 col-span-2">
          <Label>Napomena</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Čuvanje..." : initial ? "Sačuvaj izmjene" : "Dodaj mašinu"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Odustani
        </Button>
      </div>
    </form>
  );
}
