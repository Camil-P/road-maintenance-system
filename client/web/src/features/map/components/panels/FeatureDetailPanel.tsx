import type { Feature } from "geojson";
import { X } from "lucide-react";

interface Props {
  feature: Feature;
  onClose: () => void;
}

const layerLabels: Record<string, string> = {
  "road-segment": "Putna dionica",
  incident: "Incident",
  "work-zone": "Radna zona",
};

export function FeatureDetailPanel({ feature, onClose }: Props) {
  const props = feature.properties ?? {};
  const layerType = props.layerType as string;

  return (
    <div className="absolute bottom-4 left-4 w-80 bg-white rounded-lg shadow-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          {layerLabels[layerType] ?? "Detalji"}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <X className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      {layerType === "road-segment" && <RoadSegmentDetail props={props} />}
      {layerType === "incident" && <IncidentDetail props={props} />}
      {layerType === "work-zone" && <WorkZoneDetail props={props} />}
    </div>
  );
}

function RoadSegmentDetail({ props }: { props: Record<string, unknown> }) {
  return (
    <dl className="text-xs space-y-1">
      <Row label="Naziv" value={props.name as string} />
      <Row label="Kategorija" value={props.category as string} />
      <Row label="Status" value={props.status as string} />
      <Row label="Dužina" value={`${props.lengthKm} km`} />
    </dl>
  );
}

function IncidentDetail({ props }: { props: Record<string, unknown> }) {
  return (
    <dl className="text-xs space-y-1">
      <Row label="Tip" value={props.type as string} />
      <Row label="Status" value={props.status as string} />
      <Row label="Opis" value={props.description as string} />
      {props.locationDescription && (
        <Row label="Lokacija" value={props.locationDescription as string} />
      )}
    </dl>
  );
}

function WorkZoneDetail({ props }: { props: Record<string, unknown> }) {
  return (
    <dl className="text-xs space-y-1">
      <Row label="Tip rada" value={props.workType as string} />
      <Row label="Status" value={props.status as string} />
      <Row label="Prioritet" value={String(props.priority)} />
      {props.affectedLane && (
        <Row label="Strana" value={props.affectedLane as string} />
      )}
      {props.roadSegmentName && (
        <Row label="Dionica" value={props.roadSegmentName as string} />
      )}
      <Row label="Opis" value={props.description as string} />
    </dl>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-slate-500 whitespace-nowrap">{label}:</dt>
      <dd className="text-slate-800 break-words">{value}</dd>
    </div>
  );
}
