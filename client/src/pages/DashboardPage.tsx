import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Edit3,
  LogOut,
  Moon,
  Plus,
  RefreshCcw,
  Search,
  Sun,
  Trash2
} from "lucide-react";
import { Button } from "../components/Button";
import { Field, SelectField } from "../components/Field";
import { Modal } from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../services/api";
import type { Lead, LeadFilters, LeadPayload, LeadSource, LeadStatus, Pagination } from "../types";

const statuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Lost"];
const sources: LeadSource[] = ["Website", "Instagram", "Referral"];

const emptyPayload: LeadPayload = {
  name: "",
  email: "",
  status: "New",
  source: "Website"
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState<LeadFilters>({ status: "", source: "", search: "", sort: "latest" });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<LeadPayload>(emptyPayload);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("gigflow_theme") === "dark");

  const queryFilters = useMemo<LeadFilters>(
    () => ({ ...filters, search: debouncedSearch }),
    [debouncedSearch, filters]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [filters.search]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("gigflow_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getLeads(queryFilters, page);
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load leads.");
    } finally {
      setLoading(false);
    }
  }, [page, queryFilters]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const updateFilter = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    if (key !== "search") setPage(1);
  };

  const openCreate = () => {
    setModalLead(null);
    setForm(emptyPayload);
    setShowModal(true);
  };

  const openEdit = (lead: Lead) => {
    setModalLead(lead);
    setForm({ name: lead.name, email: lead.email, status: lead.status, source: lead.source });
    setShowModal(true);
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (form.name.trim().length < 2) {
      setError("Lead name must be at least 2 characters.");
      return;
    }

    try {
      setSaving(true);
      if (modalLead) {
        await api.updateLead(modalLead.id, form);
      } else {
        await api.createLead(form);
      }
      setShowModal(false);
      await loadLeads();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save lead.");
    } finally {
      setSaving(false);
    }
  };

  const deleteLead = async (lead: Lead) => {
    const confirmed = window.confirm(`Delete ${lead.name}?`);
    if (!confirmed) return;

    try {
      setError("");
      await api.deleteLead(lead.id);
      await loadLeads();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete lead.");
    }
  };

  const exportCsv = async () => {
    const token = localStorage.getItem("gigflow_token");
    const response = await fetch(api.exportCsvUrl(queryFilters), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gigflow-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">GigFlow Leads</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user?.name} - {user?.role === "admin" ? "Admin" : "Sales User"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setDarkMode((value) => !value)} title="Toggle theme">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              Theme
            </Button>
            <Button variant="secondary" onClick={exportCsv}>
              <Download size={16} />
              CSV
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} />
              New lead
            </Button>
            <Button variant="ghost" onClick={logout}>
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Search</span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
              <input
                className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="Name or email"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
              />
            </div>
          </label>
          <SelectField label="Status" value={filters.status} onChange={(event) => updateFilter("status", event.target.value as LeadFilters["status"])}>
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectField>
          <SelectField label="Source" value={filters.source} onChange={(event) => updateFilter("source", event.target.value as LeadFilters["source"])}>
            <option value="">All sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </SelectField>
          <SelectField label="Sort" value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value as LeadFilters["sort"])}>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </SelectField>
          <div className="flex items-end">
            <Button variant="secondary" onClick={loadLeads} className="w-full md:w-10 md:px-0" title="Refresh">
              <RefreshCcw size={16} />
            </Button>
          </div>
        </div>

        {error ? <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-12 text-center text-slate-500" colSpan={5}>
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td className="px-4 py-12 text-center text-slate-500" colSpan={5}>
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-4">
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-slate-500 dark:text-slate-400">{lead.email}</div>
                      </td>
                      <td className="px-4 py-4">{lead.status}</td>
                      <td className="px-4 py-4">{lead.source}</td>
                      <td className="px-4 py-4">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" onClick={() => openEdit(lead)} className="h-9 w-9 px-0" title="Edit lead">
                            <Edit3 size={15} />
                          </Button>
                          {user?.role === "admin" ? (
                            <Button variant="danger" onClick={() => deleteLead(lead)} className="h-9 w-9 px-0" title="Delete lead">
                              <Trash2 size={15} />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {pagination.pages === 0 ? 0 : pagination.page} of {pagination.pages} - {pagination.total} leads
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                Previous
              </Button>
              <Button variant="secondary" disabled={page >= pagination.pages} onClick={() => setPage((value) => value + 1)}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </section>

      {showModal ? (
        <Modal title={modalLead ? "Edit lead" : "Create lead"} onClose={() => setShowModal(false)}>
          <form className="space-y-4" onSubmit={submitLead}>
            <Field label="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            <Field label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            <SelectField label="Status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as LeadStatus }))}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </SelectField>
            <SelectField label="Source" value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value as LeadSource }))}>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </SelectField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save lead"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
};
