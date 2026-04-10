// src/features/auth/components/LoginForm.tsx
import { useState } from "react";
import { useLogin } from "../../../api/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

interface Props {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending, error } = useLogin();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    mutate(
      { email, password },
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
        <label className="block text-sm font-medium mb-1">E-mail</label>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Lozinka</label>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {(error as any)?.response?.data?.message || "Prijava nije uspjela"}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Prijavljivanje..." : "Prijavi se"}
      </Button>
    </form>
  );
}
