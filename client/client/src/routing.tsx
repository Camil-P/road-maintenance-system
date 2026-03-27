import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "./lib/auth";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { DriverDashboardPage } from "./features/dashboard/pages/DriverDashboardPage";
import { MyIncidentsPage } from "./features/incidents/pages/MyIncidentsPage";
import { CreateIncidentPage } from "./features/incidents/pages/CreateIncidentPage";
import { IncidentsListPage } from "./features/incidents/pages/IncidentsListPage";
import { ManagerDashboardPage } from "./features/dashboard/pages/ManagerDashboardPage";
import { DispatcherDashboardPage } from "./features/dashboard/pages/DispatcherDashboardPage";
import { FieldWorkerDashboardPage } from "./features/dashboard/pages/FieldWorkerDashboardPage";
import { MyWorkOrdersPage } from "./features/workOrders/pages/MyWorkOrdersPage";
import { WorkOrdersListPage } from "./features/workOrders/pages/WorkOrdersListPage";
import { RoadSegmentsListPage } from "./features/roadSegments/pages/RoadSegmentsListPage";
import { MaterialsListPage } from "./features/materials/pages/MaterialsListPage";
import { MachinesListPage } from "./features/machines/pages/MachinesListPage";
import { AnalyticsDashboardPage } from "./features/analytics/pages/AnalyticsDashboardPage";
import { UserManagementPage } from "./features/users/pages/UserManagementPage";
import { UsersListPage } from "./features/users/pages/UsersListPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";

function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function DashboardRedirect() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;

  const roleDashboards: Record<string, string> = {
    Driver: "/dashboard/driver",
    FieldWorker: "/dashboard/fieldworker",
    Dispatcher: "/dashboard/dispatcher",
    MaintenanceManager: "/dashboard/manager",
    Admin: "/dashboard/manager",
  };

  return <Navigate to={roleDashboards[user.role] || "/dashboard/driver"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <DashboardRedirect />,
      },
      // Dashboards
      {
        path: "/dashboard/driver",
        element: <DriverDashboardPage />,
      },
      {
        path: "/dashboard/dispatcher",
        element: <DispatcherDashboardPage />,
      },
      {
        path: "/dashboard/manager",
        element: <ManagerDashboardPage />,
      },
      {
        path: "/dashboard/fieldworker",
        element: <FieldWorkerDashboardPage />,
      },
      {
        path: "/dashboard",
        element: <DashboardRedirect />,
      },
      // Incidents
      {
        path: "/incidents/my",
        element: <MyIncidentsPage />,
      },
      {
        path: "/incidents/new",
        element: <CreateIncidentPage />,
      },
      {
        path: "/incidents",
        element: <IncidentsListPage />,
      },
      // Work orders
      {
        path: "/workorders",
        element: <WorkOrdersListPage />,
      },
      {
        path: "/my-workorders",
        element: <MyWorkOrdersPage />,
      },
      // Road segments
      {
        path: "/roadsegments",
        element: <RoadSegmentsListPage />,
      },
      // Materials
      {
        path: "/materials",
        element: <MaterialsListPage />,
      },
      // Machines
      {
        path: "/machines",
        element: <MachinesListPage />,
      },
      // Analytics
      {
        path: "/analytics",
        element: <AnalyticsDashboardPage />,
      },
      // Users list (Admin + MaintenanceManager)
      {
        path: "/users",
        element: <UsersListPage />,
      },
      // Admin
      {
        path: "/admin/users",
        element: <UserManagementPage />,
      },
      // Profile
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
