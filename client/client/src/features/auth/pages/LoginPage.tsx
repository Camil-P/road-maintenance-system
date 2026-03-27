// src/features/auth/pages/LoginPage.tsx
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-center">Sistem za upravljanje putevima</h1>
        <p className="text-center text-sm text-slate-600">Prijavite se na vaš nalog</p>

        <LoginForm onSuccess={() => navigate("/dashboard")} />

        <p className="text-center text-sm text-slate-600">
          Nemate nalog?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Registrujte se
          </Link>
        </p>
      </Card>
    </div>
  );
}
