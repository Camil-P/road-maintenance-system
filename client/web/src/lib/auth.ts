// src/lib/auth.ts
const TOKEN_KEY = "rms_token";

export type UserRole = "Driver" | "FieldWorker" | "Dispatcher" | "MaintenanceManager" | "Admin";

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthPayload {
  token: string;
  user: CurrentUser;
}

export function saveAuth(payload: AuthPayload) {
  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem("rms_user", JSON.stringify(payload.user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("rms_user");
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem("rms_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
