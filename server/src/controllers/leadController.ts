import mongoose from "mongoose";
import type { FilterQuery } from "mongoose";
import { Lead, type ILead, type LeadSource, type LeadStatus } from "../models/Lead.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Lost"];
const VALID_SOURCES: LeadSource[] = ["Website", "Instagram", "Referral"];
const PAGE_LIMIT = 10;

interface LeadQuery {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: "latest" | "oldest";
  page?: string;
}

const buildLeadFilter = (query: LeadQuery): FilterQuery<ILead> => {
  const filter: FilterQuery<ILead> = {};

  if (query.status && VALID_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  if (query.source && VALID_SOURCES.includes(query.source)) {
    filter.source = query.source;
  }

  if (query.search?.trim()) {
    const search = query.search.trim();
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  return filter;
};

const serializeLead = (lead: ILead) => ({
  id: lead.id,
  name: lead.name,
  email: lead.email,
  status: lead.status,
  source: lead.source,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt
});

export const getLeads = asyncHandler(async (req, res) => {
  const query = req.query as LeadQuery;
  const page = Math.max(Number(query.page ?? 1), 1);
  const sortDirection = query.sort === "oldest" ? 1 : -1;
  const filter = buildLeadFilter(query);

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: sortDirection })
      .skip((page - 1) * PAGE_LIMIT)
      .limit(PAGE_LIMIT),
    Lead.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      leads: leads.map(serializeLead),
      pagination: {
        page,
        limit: PAGE_LIMIT,
        total,
        pages: Math.ceil(total / PAGE_LIMIT)
      }
    }
  });
});

export const getLead = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid lead id", 400);
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  res.json({ success: true, data: { lead: serializeLead(lead) } });
});

export const createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create({
    ...req.body,
    createdBy: req.user?.id
  });

  res.status(201).json({ success: true, data: { lead: serializeLead(lead) } });
});

export const updateLead = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid lead id", 400);
  }

  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  res.json({ success: true, data: { lead: serializeLead(lead) } });
});

export const deleteLead = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid lead id", 400);
  }

  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  res.status(204).send();
});

export const exportLeadsCsv = asyncHandler(async (req, res) => {
  const query = req.query as LeadQuery;
  const filter = buildLeadFilter(query);
  const sortDirection = query.sort === "oldest" ? 1 : -1;
  const leads = await Lead.find(filter).sort({ createdAt: sortDirection });

  const rows = [
    ["Name", "Email", "Status", "Source", "Created At"],
    ...leads.map((lead) => [
      lead.name,
      lead.email,
      lead.status,
      lead.source,
      lead.createdAt.toISOString()
    ])
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=\"gigflow-leads.csv\"");
  res.send(csv);
});
