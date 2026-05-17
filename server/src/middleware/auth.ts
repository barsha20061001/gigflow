import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { User, type UserRole } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new AppError("Authentication token is required", 401));
    return;
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      next(new AppError("User no longer exists", 401));
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError("You do not have permission to perform this action", 403));
      return;
    }

    next();
  };
