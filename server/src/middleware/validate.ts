import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const roles = ["admin", "sales"] as const;
const statuses = ["New", "Contacted", "Qualified", "Lost"] as const;
const sources = ["Website", "Instagram", "Referral"] as const;

export const validateRegister = (req: Request, _res: Response, next: NextFunction): void => {
  const { name, email, password, role } = req.body as Record<string, string>;

  if (!name || name.trim().length < 2) return next(new AppError("Name must be at least 2 characters", 400));
  if (!email || !emailPattern.test(email)) return next(new AppError("A valid email is required", 400));
  if (!password || password.length < 8) return next(new AppError("Password must be at least 8 characters", 400));
  if (role && !roles.includes(role as (typeof roles)[number])) return next(new AppError("Invalid role", 400));

  next();
};

export const validateLogin = (req: Request, _res: Response, next: NextFunction): void => {
  const { email, password } = req.body as Record<string, string>;

  if (!email || !emailPattern.test(email)) return next(new AppError("A valid email is required", 400));
  if (!password) return next(new AppError("Password is required", 400));

  next();
};

export const validateLead = (req: Request, _res: Response, next: NextFunction): void => {
  const { name, email, status, source } = req.body as Record<string, string>;

  if (!name || name.trim().length < 2) return next(new AppError("Lead name must be at least 2 characters", 400));
  if (!email || !emailPattern.test(email)) return next(new AppError("A valid lead email is required", 400));
  if (!statuses.includes(status as (typeof statuses)[number])) return next(new AppError("Invalid lead status", 400));
  if (!sources.includes(source as (typeof sources)[number])) return next(new AppError("Invalid lead source", 400));

  next();
};
