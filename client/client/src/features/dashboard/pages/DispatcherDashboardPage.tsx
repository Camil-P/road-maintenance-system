import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DispatcherDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dispečerska kontrolna tabla</h1>
        <p className="text-xl text-slate-600">Upravljanje prijavama i radnim nalozima.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sve prijave</CardTitle>
            <CardDescription>Pregled i verifikacija prijavljenih oštećenja</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/incidents">
              <Button className="w-full">Pregledaj prijave</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Radni nalozi</CardTitle>
            <CardDescription>Kreiranje i upravljanje radnim nalozima</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/workorders">
              <Button className="w-full">Upravljaj nalozima</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
