import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

// Identical structure to DriverDashboardPage but with "My work orders" link to "/my-workorders"
export function FieldWorkerDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Kontrolna tabla radnika</h1>
        <p className="text-xl text-slate-600">Pristup vašim dodijeljenim radnim nalozima.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Moji radni nalozi</CardTitle>
            <CardDescription>Ažurirajte status dodijeljenih zadataka</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/my-workorders">
              <Button className="w-full">Pregledaj naloge</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
