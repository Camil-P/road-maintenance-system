// src/features/incidents/pages/CreateIncidentPage.tsx
import { IncidentForm } from "../components/IncidentForm";

export function CreateIncidentPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Prijavi novo oštećenje</h1>
      <IncidentForm />
    </div>
  );
}
