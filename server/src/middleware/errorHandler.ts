import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

export const notFound: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong"
  });
};
