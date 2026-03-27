import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

// Similar to Dispatcher but with reporting links if Phase 5 later
export function ManagerDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Menadžerska kontrolna tabla</h1>
        <p className="text-xl text-slate-600">Pregled svih operacija.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Sve prijave</CardTitle></CardHeader>
          <CardContent><Link to="/incidents"><Button className="w-full">Pregled</Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Radni nalozi</CardTitle></CardHeader>
          <CardContent><Link to="/workorders"><Button className="w-full">Upravljaj</Button></Link></CardContent>
        </Card>
      </div>
    </div>
  );
}
