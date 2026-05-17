import type { Lead, LeadFilters, LeadPayload, Pagination, User, UserRole } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthData {
  token: string;
  user: User;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem("gigflow_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new ApiError(payload.message ?? "Request failed", response.status);
  }

  return payload.data;
};

export const api = {
  register: (body: { name: string; email: string; password: string; role: UserRole }) =>
    request<AuthData>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthData>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<{ user: User }>("/auth/me"),
  getLeads: (filters: LeadFilters, page: number) => {
    const params = new URLSearchParams({
      page: String(page),
      sort: filters.sort
    });
    if (filters.status) params.set("status", filters.status);
    if (filters.source) params.set("source", filters.source);
    if (filters.search.trim()) params.set("search", filters.search.trim());

    return request<{ leads: Lead[]; pagination: Pagination }>(`/leads?${params.toString()}`);
  },
  createLead: (payload: LeadPayload) =>
    request<{ lead: Lead }>("/leads", { method: "POST", body: JSON.stringify(payload) }),
  updateLead: (id: string, payload: LeadPayload) =>
    request<{ lead: Lead }>(`/leads/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteLead: (id: string) => request<void>(`/leads/${id}`, { method: "DELETE" }),
  exportCsvUrl: (filters: LeadFilters) => {
    const params = new URLSearchParams({ sort: filters.sort });
    if (filters.status) params.set("status", filters.status);
    if (filters.source) params.set("source", filters.source);
    if (filters.search.trim()) params.set("search", filters.search.trim());
    return `${API_URL}/leads/export/csv?${params.toString()}`;
  }
};
