import { useState } from "react";
import {
  useHotspotsQuery,
  useResponseTimeQuery,
  useBudgetOverviewQuery,
  type HotspotFilter,
  type AnalyticsPeriodFilter,
} from "@/api/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const today = new Date();
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  .toISOString()
  .slice(0, 10);
const todayStr = today.toISOString().slice(0, 10);

export function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState<AnalyticsPeriodFilter>({
    fromDate: firstOfMonth,
    toDate: todayStr,
  });
  const [hotspotParams, setHotspotParams] = useState<HotspotFilter>({
    fromDate: firstOfMonth,
    toDate: todayStr,
    clusterRadiusMeters: 500,
    minimumIncidents: 3,
  });
  const [appliedPeriod, setAppliedPeriod] = useState<AnalyticsPeriodFilter>(period);
  const [appliedHotspot, setAppliedHotspot] = useState<HotspotFilter>(hotspotParams);

  const responseTimeQuery = useResponseTimeQuery(appliedPeriod);
  const budgetQuery = useBudgetOverviewQuery(appliedPeriod);
  const hotspotsQuery = useHotspotsQuery(appliedHotspot);

  const rt = responseTimeQuery.data?.data;
  const budget = budgetQuery.data?.data;
  const hotspots = hotspotsQuery.data?.data ?? [];

  const applyFilters = () => {
    setAppliedPeriod(period);
    setAppliedHotspot({ ...hotspotParams, fromDate: period.fromDate, toDate: period.toDate });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Analitika</h1>

      {/* Period filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label>Od datuma</Label>
              <Input
                type="date"
                value={period.fromDate ?? ""}
                onChange={(e) => setPeriod((p) => ({ ...p, fromDate: e.target.value || undefined }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Do datuma</Label>
              <Input
                type="date"
                value={period.toDate ?? ""}
                onChange={(e) => setPeriod((p) => ({ ...p, toDate: e.target.value || undefined }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Radius klastera (m)</Label>
              <Input
                type="number"
                min={50}
                step={50}
                value={hotspotParams.clusterRadiusMeters ?? 500}
                onChange={(e) =>
                  setHotspotParams((p) => ({ ...p, clusterRadiusMeters: Number(e.target.value) }))
                }
                className="w-28"
              />
            </div>
            <div className="space-y-1">
              <Label>Min. incidenata</Label>
              <Input
                type="number"
                min={1}
                value={hotspotParams.minimumIncidents ?? 3}
                onChange={(e) =>
                  setHotspotParams((p) => ({ ...p, minimumIncidents: Number(e.target.value) }))
                }
                className="w-24"
              />
            </div>
            <Button onClick={applyFilters}>Primijeni</Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-slate-500">Prosječno vrijme odgovora</CardTitle>
          </CardHeader>
          <CardContent>
            {responseTimeQuery.isLoading ? (
              <p className="text-slate-400 text-sm">Učitavanje...</p>
            ) : rt ? (
              <>
                <p className="text-3xl font-bold">{rt.averageHours.toFixed(1)}h</p>
                <p className="text-xs text-slate-500 mt-1">{rt.incidentCount} incidenata</p>
              </>
            ) : (
              <p className="text-slate-400 text-sm">Nema podataka</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-slate-500">Troškovi – Hitni</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetQuery.isLoading ? (
              <p className="text-slate-400 text-sm">Učitavanje...</p>
            ) : budget ? (
              <p className="text-3xl font-bold text-red-600">€{budget.emergencyCost.toLocaleString()}</p>
            ) : (
              <p className="text-slate-400 text-sm">Nema podataka</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-slate-500">Troškovi – Redovni / Ukupno</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetQuery.isLoading ? (
              <p className="text-slate-400 text-sm">Učitavanje...</p>
            ) : budget ? (
              <>
                <p className="text-3xl font-bold text-blue-600">€{budget.regularCost.toLocaleString()}</p>
                <p className="text-sm text-slate-600 mt-1">
                  Ukupno: <span className="font-semibold">€{budget.totalCost.toLocaleString()}</span>
                </p>
              </>
            ) : (
              <p className="text-slate-400 text-sm">Nema podataka</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hotspots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hotspot lokacije (klasteri incidenata)</CardTitle>
        </CardHeader>
        <CardContent>
          {hotspotsQuery.isLoading && <p className="text-sm text-slate-500">Učitavanje...</p>}
          {hotspotsQuery.isError && <p className="text-sm text-red-600">Greška pri učitavanju hotspot podataka.</p>}
          {!hotspotsQuery.isLoading && hotspots.length === 0 && (
            <p className="text-sm text-slate-500">Nema hotspot lokacija za izabrani period i parametre.</p>
          )}
          {hotspots.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Geografska širina</TableHead>
                  <TableHead>Geografska dužina</TableHead>
                  <TableHead>Broj incidenata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotspots.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{h.centerLatitude.toFixed(5)}</TableCell>
                    <TableCell>{h.centerLongitude.toFixed(5)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800">
                        {h.incidentCount}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
