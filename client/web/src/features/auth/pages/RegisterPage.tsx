// src/features/auth/pages/RegisterPage.tsx
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-center">Kreiranje vozačkog naloga</h1>
        <p className="text-center text-sm text-slate-600">
          Bićete registrovani kao Vozač.
        </p>

        <RegisterForm onSuccess={() => navigate("/dashboard")} />

        <p className="text-center text-sm text-slate-600">
          Već imate nalog?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Prijavite se
          </Link>
        </p>
      </Card>
    </div>
  );
}
