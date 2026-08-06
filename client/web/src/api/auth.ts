// src/api/auth.ts
import { useMutation } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import type { AuthPayload } from "@/lib/auth";
import { saveAuth, clearAuth, getCurrentUser, type UserRole } from "@/lib/auth";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
}

async function loginApi(data: LoginInput): Promise<AuthPayload> {
  const res = await httpClient.post("/auth/login", data);
  const apiData = res.data.data;

  return {
    token: apiData.token,
    user: {
      id: apiData.userId,
      email: apiData.email,
      role: apiData.roles[0] || "User",
      agencyId: apiData.agencyId, // <-- Extract agencyId from backend response
    },
  };
}

async function registerApi(data: RegisterInput): Promise<AuthPayload> {
  const res = await httpClient.post<AuthPayload>("/auth/register", data);
  return res.data;
}

// Enable when test is finished and the API is up
export function useLogin() {
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (payload) => {
      saveAuth(payload);
    },
  });
}

// Temporary mock for login until API is ready
// export function useLogin() {
//   return {
//     mutate: (_data: any, { onSuccess }: any) => {
//       setTimeout(() => {
//         // Simulate a successful login
//         const payload = {
//           token: "fake-token",
//           user: {
//             id: "1",
//             email: "test@example.com",
//             role: "Driver" as UserRole, // or whatever roles you use
//           },
//         };
//         saveAuth(payload);
//         onSuccess?.(payload);
//       }, 100);
//     },
//     isPending: false,
//     error: null,
//   };
// }

export function useRegister() {
  return useMutation({
    mutationFn: registerApi,
    onSuccess: (payload) => {
      saveAuth(payload);
    },
  });
}

// simple “current user” hook using localStorage
export function useCurrentUser() {
  const user = getCurrentUser();
  return { user };
}

export function useLogout() {
  return () => {
    clearAuth();
    window.location.href = "/login";
  };
}
