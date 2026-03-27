import { Button } from "@/components/ui/button";
import { WorkOrderForm } from "@/features/workOrders/components/WorkOrderForm";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { useState } from "react";

// Update interface and usage:
interface Props {
  incidentId: string;
}

export function IncidentCreateWOButton({ incidentId }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Kreiraj RN</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <WorkOrderForm incidentId={incidentId} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
