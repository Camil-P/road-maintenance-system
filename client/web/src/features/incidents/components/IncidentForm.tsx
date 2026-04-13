// src/features/incidents/components/IncidentForm.tsx
import type React from "react";
import { useState } from "react";
import { useCreateIncidentMutation } from "@/api/incidents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onSuccess?: () => void;
}

const INCIDENT_TYPES = ["Pothole", "Ice", "Debris", "Flooding", "Traffic Light Issue", "Guardrail Damage", "Road Marking Issue", "Sign Issue", "Other"];
const INCIDENT_TYPE_LABELS: Record<string, string> = {
  Pothole: "Rupa na putu",
  Ice: "Led",
  Debris: "Krhotine/Otpad",
  Flooding: "Poplava",
  "Traffic Light Issue": "Problem sa semaforom",
  "Guardrail Damage": "Oštećena ograda",
  "Road Marking Issue": "Problem s oznakama",
  "Sign Issue": "Problem sa znakom",
  Other: "Ostalo",
};

export function IncidentForm({ onSuccess }: Props) {
  const [type, setType] = useState(INCIDENT_TYPES[0]);
  const [description, setDescription] = useState("");
  const [roadSegmentId, setRoadSegmentId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const { mutate, isPending, error } = useCreateIncidentMutation();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    mutate(
      {
        type, // Mapped to match backend CreateIncidentRequest
        description,
        roadSegmentId: roadSegmentId || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      },
      {
        onSuccess: () => {
          setDescription("");
          setRoadSegmentId("");
          setLatitude("");
          setLongitude("");
          onSuccess?.();
        },
      }
    );
  };

  const serverError =
    (error as any)?.response?.data?.message ||
    (error as any)?.response?.data ||
    undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-1">Tip oštećenja</label>
        <Select value={type} onChange={e => setType(e.target.value)}>
          {INCIDENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {INCIDENT_TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Opis</label>
        <Textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ID dionice</label>
          <Input
            value={roadSegmentId}
            onChange={(e) => setRoadSegmentId(e.target.value)}
            placeholder="opcionalno"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Geografska širina</label>
          <Input
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="opcionalno"
            type="number"
            step="any"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Geografska dužina</label>
          <Input
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="opcionalno"
            type="number"
            step="any"
          />
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-red-600">
          {typeof serverError === "string" ? serverError : "Greška pri kreiranju prijave"}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Slanje..." : "Pošalji prijavu"}
      </Button>
    </form>
  );
}