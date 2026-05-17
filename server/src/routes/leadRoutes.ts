import { Router } from "express";
import {
  createLead,
  deleteLead,
  exportLeadsCsv,
  getLead,
  getLeads,
  updateLead
} from "../controllers/leadController.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validateLead } from "../middleware/validate.js";

export const leadRouter = Router();

leadRouter.use(protect);
leadRouter.get("/export/csv", exportLeadsCsv);
leadRouter.route("/").get(getLeads).post(validateLead, createLead);
leadRouter
  .route("/:id")
  .get(getLead)
  .put(validateLead, updateLead)
  .delete(requireRole("admin"), deleteLead);
