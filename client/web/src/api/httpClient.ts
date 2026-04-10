// src/api/httpClient.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { getToken } from "../lib/auth";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7204/api",
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else if (config.headers && typeof config.headers === "object") {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
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