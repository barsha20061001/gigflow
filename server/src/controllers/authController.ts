import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { Response } from "express";
import { env } from "../config/env.js";
import { User, type IUser, type UserRole } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signToken = (id: string): string =>
  jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] });

const authResponse = (res: Response, user: IUser, statusCode = 200): void => {
  res.status(statusCode).json({
    success: true,
    data: {
      token: signToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  };

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await User.create({ name, email, password, role: role ?? "sales" });
  authResponse(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  authResponse(res, user);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
