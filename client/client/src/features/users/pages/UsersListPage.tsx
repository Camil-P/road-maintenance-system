import { useState } from "react";
import {
  useUsersQuery,
  useSetUserActiveMutation,
  useAssignUserRoleMutation,
  type UserQueryParameters,
} from "@/api/users";
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
import { Select } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/auth";

const ALL_ROLES = ["Driver", "FieldWorker", "Dispatcher", "MaintenanceManager", "Admin"];

const ROLE_LABELS: Record<string, string> = {
  Driver: "Vozač",
  FieldWorker: "Radnik na terenu",
  Dispatcher: "Dispečer",
  MaintenanceManager: "Menadžer održavanja",
  Admin: "Administrator",
};

export function UsersListPage() {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "Admin";

  const [filters, setFilters] = useState<UserQueryParameters>({});
  const [appliedFilters, setAppliedFilters] = useState<UserQueryParameters>({});

  const { data, isLoading, isError } = useUsersQuery(appliedFilters);
  const setActiveMutation = useSetUserActiveMutation();
  const assignRoleMutation = useAssignUserRoleMutation();

  const users = data?.data ?? [];

  const [roleEdit, setRoleEdit] = useState<{ userId: string; role: string } | null>(null);

  const applyFilters = () => setAppliedFilters(filters);

  const clearFilters = () => {
    setFilters({});
    setAppliedFilters({});
  };

  const handleToggleActive = (userId: string, currentlyActive: boolean) => {
    setActiveMutation.mutate({ userId, isActive: !currentlyActive });
  };

  const handleAssignRole = () => {
    if (!roleEdit) return;
    assignRoleMutation.mutate(
      { userId: roleEdit.userId, role: roleEdit.role },
      { onSuccess: () => setRoleEdit(null) }
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Pregled korisnika</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Pretraga</label>
          <Input
            placeholder="Ime, prezime, email..."
            value={filters.searchTerm ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, searchTerm: e.target.value || undefined }))}
            className="w-52"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Uloga</label>
          <Select
            value={filters.role ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value || undefined }))}
          >
            <option value="">Sve uloge</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Status</label>
          <Select
            value={filters.isActive === undefined ? "" : filters.isActive ? "true" : "false"}
            onChange={(e) => {
              const val = e.target.value;
              setFilters((p) => ({
                ...p,
                isActive: val === "" ? undefined : val === "true",
              }));
            }}
          >
            <option value="">Svi</option>
            <option value="true">Aktivni</option>
            <option value="false">Neaktivni</option>
          </Select>
        </div>
        <Button size="sm" onClick={applyFilters}>Pretraži</Button>
        <Button size="sm" variant="outline" onClick={clearFilters}>Ukloni filtere</Button>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Učitavanje korisnika...</p>}
      {isError && <p className="text-sm text-red-600">Greška pri učitavanju korisnika.</p>}

      {!isLoading && users.length === 0 && (
        <p className="text-sm text-slate-500">Nema korisnika koji odgovaraju filteru.</p>
      )}

      {users.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ime i prezime</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Uloga</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Akcija</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.userId} className={!u.isActive ? "opacity-60" : undefined}>
                <TableCell className="font-medium">
                  {u.firstName} {u.lastName}
                </TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell>
                  {roleEdit?.userId === u.userId ? (
                    <div className="flex gap-1 items-center">
                      <Select
                        value={roleEdit.role}
                        onChange={(e) => setRoleEdit((p) => p ? { ...p, role: e.target.value } : p)}
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </Select>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        disabled={assignRoleMutation.isPending}
                        onClick={handleAssignRole}
                      >
                        OK
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setRoleEdit(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
                      {u.roles.map((r) => ROLE_LABELS[r] ?? r).join(", ")}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                      u.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {u.isActive ? "Aktivan" : "Neaktivan"}
                  </span>
                </TableCell>
                {(isAdmin && u.userId != currentUser.id) &&(
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-7 text-xs ${
                          u.isActive
                            ? "text-red-700 border-red-300"
                            : "text-green-700 border-green-300"
                        }`}
                        disabled={setActiveMutation.isPending}
                        onClick={() => handleToggleActive(u.userId, u.isActive)}
                      >
                        {u.isActive ? "Deaktiviraj" : "Aktiviraj"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setRoleEdit({ userId: u.userId, role: u.roles[0] ?? "Driver" })}
                      >
                        Uloga
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
