import { useState } from "react";
import { useUpdateProfileMutation } from "@/api/users";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfilePage() {
  const user = getCurrentUser();
  const updateProfileMutation = useUpdateProfileMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    updateProfileMutation.mutate(
      { firstName, lastName },
      {
        onSuccess: () => setSuccess(true),
        onError: () => setError("Greška pri ažuriranju profila."),
      }
    );
  };

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-xl font-semibold">Moj profil</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informacije o nalogu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="font-medium text-slate-600">Email:</span> {user?.email}</p>
          <p><span className="font-medium text-slate-600">Uloga:</span> {user?.role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Promjena imena i prezimena</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label>Ime</Label>
              <Input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Unesite novo ime"
              />
            </div>
            <div className="space-y-1">
              <Label>Prezime</Label>
              <Input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Unesite novo prezime"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">Profil uspješno ažuriran.</p>}
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Čuvanje..." : "Sačuvaj"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
