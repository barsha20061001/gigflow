export type UserRole = "admin" | "sales";
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
export type LeadSource = "Website" | "Instagram" | "Referral";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LeadFilters {
  status: "" | LeadStatus;
  source: "" | LeadSource;
  search: string;
  sort: "latest" | "oldest";
}
