import { NavLink } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";
import {
  FileText,
  PlusCircle,
  LayoutDashboard,
  Map,
  ClipboardList,
  HardHat,
  AlertTriangle,
  Package,
  Truck,
  BarChart2,
  Users,
  User,
} from "lucide-react";

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded px-3 py-2 hover:bg-slate-100 text-sm transition-colors ${
    isActive ? "bg-slate-200 font-semibold text-blue-700" : "text-slate-600"
  }`;

export function Sidebar() {
  const user = getCurrentUser();
  const role = user?.role || "";

  const isAdmin = role === "Admin";
  const isAdminOrManager = ["Admin", "MaintenanceManager", "Dispatcher"].includes(role);
  const isFieldWorker = ["FieldWorker", "MaintenanceManager", "Admin"].includes(role);
  const isReporter = ["Driver", "Dispatcher", "Admin"].includes(role);
  const canViewAnalytics = ["Admin", "MaintenanceManager", "Dispatcher"].includes(role);

  return (
    <aside className="w-60 border-r bg-white p-4 flex flex-col space-y-6 overflow-y-auto">
      <div className="px-3 py-2 font-bold text-lg tracking-tight text-slate-900">
        Održavanje puteva IS
      </div>

      <nav className="flex-1 space-y-1">
        {/* OPŠTE */}
        <NavLink to="/dashboard" className={linkClasses}>
          <LayoutDashboard className="h-4 w-4" />
          Kontrolna tabla
        </NavLink>

        <hr className="my-2 border-slate-200" />

        {/* SEKCIJA: INCIDENTI (PRIJAVE) */}
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
          Incidenti i Prijave
        </div>

        {isReporter && (
          <NavLink to="/incidents/new" className={linkClasses}>
            <PlusCircle className="h-4 w-4 text-orange-600" />
            Prijavi oštećenje
          </NavLink>
        )}

        {role === "Driver" && (
          <NavLink to="/incidents/my" className={linkClasses}>
            <AlertTriangle className="h-4 w-4" />
            Moje prijave
          </NavLink>
        )}

        {isAdminOrManager && (
          <NavLink to="/incidents" end className={linkClasses}>
            <FileText className="h-4 w-4" />
            Sve prijave (Pregled)
          </NavLink>
        )}

        <hr className="my-2 border-slate-200" />

        {/* SEKCIJA: RADNI NALOZI (OPERATIVA) */}
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
          Operativa
        </div>

        {isFieldWorker && (
          <NavLink to="/my-workorders" className={linkClasses}>
            <HardHat className="h-4 w-4" />
            Moji zadaci
          </NavLink>
        )}

        {isAdminOrManager && (
          <NavLink to="/workorders" className={linkClasses}>
            <ClipboardList className="h-4 w-4" />
            Svi radni nalozi
          </NavLink>
        )}

        {/* SEKCIJA: RESURSI */}
        {isAdminOrManager && (
          <>
            <hr className="my-2 border-slate-200" />
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
              Resursi
            </div>
            <NavLink to="/roadsegments" className={linkClasses}>
              <Map className="h-4 w-4" />
              Putna mreža
            </NavLink>
            <NavLink to="/materials" className={linkClasses}>
              <Package className="h-4 w-4" />
              Materijali
            </NavLink>
            <NavLink to="/machines" className={linkClasses}>
              <Truck className="h-4 w-4" />
              Mašine i vozila
            </NavLink>
          </>
        )}

        {/* SEKCIJA: ANALITIKA */}
        {canViewAnalytics && (
          <>
            <hr className="my-2 border-slate-200" />
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
              Analitika
            </div>
            <NavLink to="/analytics" className={linkClasses}>
              <BarChart2 className="h-4 w-4" />
              Pregled analitike
            </NavLink>
          </>
        )}

        {/* SEKCIJA: ADMINISTRACIJA */}
        {(isAdmin || role === "MaintenanceManager") && (
          <>
            <hr className="my-2 border-slate-200" />
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
              Administracija
            </div>
            <NavLink to="/users" className={linkClasses}>
              <Users className="h-4 w-4" />
              Korisnici
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/users" className={linkClasses}>
                <Users className="h-4 w-4" />
                Kreiranje naloga
              </NavLink>
            )}
          </>
        )}

        <hr className="my-2 border-slate-200" />
        <NavLink to="/profile" className={linkClasses}>
          <User className="h-4 w-4" />
          Moj profil
        </NavLink>
      </nav>
    </aside>
  );
}
