import { useState } from "react";
import {
  useAdminRegisterMutation,
  useSetUserActiveMutation,
  useAssignUserRoleMutation,
  type AdminRegisterInput,
} from "@/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRole } from "@/lib/auth";

const STAFF_ROLES: UserRole[] = ["FieldWorker", "Dispatcher", "MaintenanceManager"];

const ROLE_LABELS: Record<string, string> = {
  FieldWorker: "Radnik na terenu",
  Dispatcher: "Dispečer",
  MaintenanceManager: "Menadžer održavanja",
};

const DEFAULT_FORM: AdminRegisterInput = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  role: "FieldWorker",
};

export function UserManagementPage() {
  const [form, setForm] = useState<AdminRegisterInput>(DEFAULT_FORM);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [userId, setUserId] = useState("");
  const [newRole, setNewRole] = useState<string>("FieldWorker");
  const [roleSuccess, setRoleSuccess] = useState(false);
  const [activeSuccess, setActiveSuccess] = useState(false);

  const registerMutation = useAdminRegisterMutation();
  const setActiveMutation = useSetUserActiveMutation();
  const assignRoleMutation = useAssignUserRoleMutation();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(false);
    if (form.password !== form.confirmPassword) {
      setRegisterError("Lozinke se ne poklapaju.");
      return;
    }
    registerMutation.mutate(form, {
      onSuccess: () => {
        setRegisterSuccess(true);
        setForm(DEFAULT_FORM);
      },
      onError: () => {
        setRegisterError("Greška pri kreiranju naloga.");
      },
    });
  };

  const handleSetActive = (isActive: boolean) => {
    if (!userId.trim()) return;
    setActiveSuccess(false);
    setActiveMutation.mutate({ userId: userId.trim(), isActive }, {
      onSuccess: () => setActiveSuccess(true),
    });
  };

  const handleAssignRole = () => {
    if (!userId.trim()) return;
    setRoleSuccess(false);
    assignRoleMutation.mutate({ userId: userId.trim(), role: newRole }, {
      onSuccess: () => setRoleSuccess(true),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Upravljanje korisnicima</h1>

      {/* Register Staff */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kreiranje novog naloga (personal)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid grid-cols-2 gap-4 max-w-xl">
            <div className="space-y-1">
              <Label>Ime</Label>
              <Input
                required
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Prezime</Label>
              <Input
                required
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Lozinka</Label>
              <Input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Potvrda lozinke</Label>
              <Input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Uloga</Label>
              <Select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
              >
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </Select>
            </div>
            {registerError && (
              <p className="col-span-2 text-sm text-red-600">{registerError}</p>
            )}
            {registerSuccess && (
              <p className="col-span-2 text-sm text-green-600">Nalog uspješno kreiran.</p>
            )}
            <div className="col-span-2">
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Kreiranje..." : "Kreiraj nalog"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Manage existing user */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upravljanje postojećim korisnikom</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-xl">
          <div className="space-y-1">
            <Label>User ID</Label>
            <Input
              placeholder="Unesite ID korisnika"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setRoleSuccess(false);
                setActiveSuccess(false);
              }}
            />
          </div>

          {/* Activate / Deactivate */}
          <div className="space-y-1">
            <Label>Aktivnost naloga</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!userId.trim() || setActiveMutation.isPending}
                onClick={() => handleSetActive(true)}
              >
                Aktiviraj
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300"
                disabled={!userId.trim() || setActiveMutation.isPending}
                onClick={() => handleSetActive(false)}
              >
                Deaktiviraj
              </Button>
            </div>
            {activeSuccess && <p className="text-sm text-green-600">Status ažuriran.</p>}
          </div>

          {/* Change Role */}
          <div className="space-y-1">
            <Label>Dodijeli ulogu</Label>
            <div className="flex gap-2 items-center">
              <Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
                <option value="Driver">Vozač</option>
                <option value="Admin">Admin</option>
              </Select>
              <Button
                size="sm"
                disabled={!userId.trim() || assignRoleMutation.isPending}
                onClick={handleAssignRole}
              >
                Primijeni
              </Button>
            </div>
            {roleSuccess && <p className="text-sm text-green-600">Uloga ažurirana.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
