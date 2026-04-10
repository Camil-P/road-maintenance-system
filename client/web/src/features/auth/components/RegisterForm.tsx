// src/features/auth/components/RegisterForm.tsx
import { useState } from "react";
import { useRegister } from "../../../api/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

interface Props {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending, error } = useRegister();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    mutate(
      { email, password, fullName },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-sm font-medium mb-1">Ime i prezime</label>
        <Input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">E-mail</label>
        <Input
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Lozinka</label>
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {(error as any)?.response?.data?.message || "Registracija nije uspjela"}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Kreiranje naloga..." : "Kreiraj nalog"}
      </Button>
    </form>
  );
}
