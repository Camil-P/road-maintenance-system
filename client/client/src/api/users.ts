import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient, type ApiResponse } from "@/api/httpClient";
import type { UserRole } from "@/lib/auth";

export interface AdminRegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AdminRegisterResponse {
  token: string;
  expiration: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

// Maps to UserResponse from the backend
export interface UserResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
}

export interface UserQueryParameters {
  searchTerm?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
}

// --- API Functions ---

async function fetchUsersApi(params?: UserQueryParameters) {
  const res = await httpClient.get<ApiResponse<UserResponse[]>>("/auth/users", { params });
  return res.data;
}


async function adminRegisterApi(data: AdminRegisterInput) {
  const res = await httpClient.post<ApiResponse<AdminRegisterResponse>>("/auth/admin/register", data);
  return res.data;
}

async function setUserActiveApi({ userId, isActive }: { userId: string; isActive: boolean }) {
  const res = await httpClient.patch<ApiResponse<null>>(`/auth/users/${userId}/active`, { isActive });
  return res.data;
}

async function assignUserRoleApi({ userId, role }: { userId: string; role: string }) {
  const res = await httpClient.patch<ApiResponse<null>>(`/auth/users/${userId}/role`, { role });
  return res.data;
}

async function updateProfileApi(data: UpdateProfileInput) {
  const res = await httpClient.put<ApiResponse<null>>("/auth/me/profile", data);
  return res.data;
}

// --- Hooks ---

export function useUsersQuery(params?: UserQueryParameters) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchUsersApi(params),
  });
}


export function useAdminRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminRegisterApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useSetUserActiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setUserActiveApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAssignUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignUserRoleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: updateProfileApi,
  });
}
