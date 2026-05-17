import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  port: number;
  clientUrl: string;
}

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env: EnvConfig = {
  mongoUri: required("MONGO_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  port: Number(process.env.PORT ?? 5000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173"
};
