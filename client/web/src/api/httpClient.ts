// src/api/httpClient.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { getCurrentUser, getToken } from "../lib/auth";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7204/api",
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  const user = getCurrentUser();

  if (config.headers instanceof AxiosHeaders) {
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    // <-- Add the AgencyId header if the user exists, has an agencyId, and is NOT a SystemAdmin
    if (user && user.role !== "Admin" && user.agencyId) {
      config.headers.set("X-Agency-Id", user.agencyId); // Adjust "X-Agency-Id" to match your backend expected header
    }

  } else if (config.headers && typeof config.headers === "object") {
    const headers = config.headers as Record<string, string>;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // <-- Fallback object assignment for older axios versions or generic objects
    if (user && user.role !== "Admin" && user.agencyId) {
      headers["X-Agency-Id"] = user.agencyId;
    }
  }

  return config;
});

// Maps to ApiResponse<T> in C#
export interface ApiResponse<T> {
  data: T;
  message?: string;
  isSuccess: boolean;
  errors?: string[];
}

// Maps to PaginatedResponse<T> in IncidentContracts.cs
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}