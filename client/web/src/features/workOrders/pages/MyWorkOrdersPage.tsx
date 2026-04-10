import { WorkOrderTable } from "../components/WorkOrderTable";

export function MyWorkOrdersPage() {
  return (
      <div className="p-6">
        <WorkOrderTable assignedOnly />
      </div>
  );
}
