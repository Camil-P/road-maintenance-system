import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DriverDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Vozačka kontrolna tabla</h1>
        <p className="text-xl text-slate-600">
          Brzi pristup vašim prijavama i aktivnostima.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Moje prijave</CardTitle>
            <CardDescription>Pregled prijava koje ste prijavili</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/incidents/my">
              <Button className="w-full">Pregledaj prijave</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prijavi oštećenje</CardTitle>
            <CardDescription>Prijavite novo oštećenje na cesti</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/incidents/new">
              <Button className="w-full">Prijavi oštećenje</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
