// src/features/auth/components/LoginForm.tsx
import { useState } from "react";
import { useLogin } from "../../../api/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const isDev = import.meta.env.DEV;

const DEV_USERS = [
  { label: "Admin", email: "cplojovic@gmail.com", password: "Camil!123" },
  { label: "Manager", email: "marija.petrovic@putevi.rs", password: "Test@1234!" },
  { label: "Dispatcher", email: "nikola.jovanovic@putevi.rs", password: "Test@1234!" },
  { label: "Field Worker", email: "dragan.stojanovic@putevi.rs", password: "Test@1234!" },
  { label: "Driver", email: "zoran.lazic@putevi.rs", password: "Test@1234!" },
] as const;

interface Props {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: Props) {
  const [email, setEmail] = useState(isDev ? DEV_USERS[0].email : "");
  const [password, setPassword] = useState(isDev ? DEV_USERS[0].password : "");
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
      {isDev && (
        <div className="flex flex-wrap gap-2">
          {DEV_USERS.map((user) => (
            <button
              key={user.email}
              type="button"
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                email === user.email
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted border-border hover:bg-accent"
              }`}
              onClick={() => {
                setEmail(user.email);
                setPassword(user.password);
              }}
            >
              {user.label}
            </button>
          ))}
        </div>
      )}

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
