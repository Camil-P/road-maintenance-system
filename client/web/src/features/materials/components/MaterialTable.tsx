import { useState } from "react";
import type { MaterialResponse } from "@/api/materials";
import { useAddStockMutation, useConsumeStockMutation } from "@/api/materials";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  materials: MaterialResponse[];
  onEdit: (material: MaterialResponse) => void;
}

export function MaterialTable({ materials, onEdit }: Props) {
  const addStockMutation = useAddStockMutation();
  const consumeStockMutation = useConsumeStockMutation();

  const [stockAction, setStockAction] = useState<{
    id: string;
    type: "add" | "consume";
    qty: string;
    workOrderId: string;
  } | null>(null);

  const handleStockSubmit = () => {
    if (!stockAction) return;
    const quantity = parseFloat(stockAction.qty);
    if (isNaN(quantity) || quantity <= 0) return;
    const payload = {
      id: stockAction.id,
      quantity,
      workOrderId: stockAction.workOrderId || undefined,
    };
    if (stockAction.type === "add") {
      addStockMutation.mutate(payload, { onSuccess: () => setStockAction(null) });
    } else {
      consumeStockMutation.mutate(payload, { onSuccess: () => setStockAction(null) });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Naziv</TableHead>
          <TableHead>Jedinica</TableHead>
          <TableHead>Količina</TableHead>
          <TableHead>Prag</TableHead>
          <TableHead>Cijena/j</TableHead>
          <TableHead>Ukupna vrijednost</TableHead>
          <TableHead>Akcija</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((m) => (
          <TableRow key={m.id} className={m.isBelowThreshold ? "bg-red-50" : undefined}>
            <TableCell className="font-medium">
              {m.name}
              {m.isBelowThreshold && (
                <span className="ml-2 text-xs text-red-600 font-semibold">⚠ Ispod praga</span>
              )}
            </TableCell>
            <TableCell>{m.unit}</TableCell>
            <TableCell>{m.currentQuantity.toLocaleString()}</TableCell>
            <TableCell>{m.minimumThreshold.toLocaleString()}</TableCell>
            <TableCell>€{m.unitCost.toFixed(2)}</TableCell>
            <TableCell>€{m.totalValue.toLocaleString()}</TableCell>
            <TableCell>
              {stockAction?.id === m.id ? (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1 items-center">
                    <Input
                      className="h-7 w-20 text-xs"
                      type="number"
                      placeholder="Kol."
                      value={stockAction.qty}
                      onChange={(e) => setStockAction((p) => p ? { ...p, qty: e.target.value } : p)}
                    />
                    {stockAction.type === "consume" && (
                      <Input
                        className="h-7 w-28 text-xs"
                        placeholder="ID nal. (opt.)"
                        value={stockAction.workOrderId}
                        onChange={(e) => setStockAction((p) => p ? { ...p, workOrderId: e.target.value } : p)}
                      />
                    )}
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      disabled={addStockMutation.isPending || consumeStockMutation.isPending}
                      onClick={handleStockSubmit}
                    >
                      OK
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setStockAction(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-green-700 border-green-300"
                    onClick={() => setStockAction({ id: m.id, type: "add", qty: "", workOrderId: "" })}
                  >
                    + Dopuni
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-orange-700 border-orange-300"
                    onClick={() => setStockAction({ id: m.id, type: "consume", qty: "", workOrderId: "" })}
                  >
                    − Utroši
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => onEdit(m)}
                  >
                    Uredi
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
