import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { authRouter } from "./routes/authRoutes.js";
import { leadRouter } from "./routes/leadRoutes.js";
import { AppError } from "./utils/AppError.js";
import { notFound } from "./middleware/errorHandler.js";

export const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "GigFlow API is healthy" });
});

app.use("/api/auth", authRouter);
app.use("/api/leads", leadRouter);

app.use((_req, _res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(notFound);
