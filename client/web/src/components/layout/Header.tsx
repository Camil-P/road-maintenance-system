// src/components/layout/Header.tsx
import { Link } from "react-router-dom";
import { useCurrentUser, useLogout } from "../../api/auth";

export function Header() {
  const { user } = useCurrentUser();
  const logout = useLogout();

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4">
      <Link to="/dashboard" className="font-semibold">
        Road Maintenance System
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user && (
          <>
            <span>{user.email}</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
              {user.role}
            </span>
            <button
              type="button"
              onClick={logout}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
