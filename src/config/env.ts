import dotenv from "dotenv";
dotenv.config();

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable");
}

export const env = {
  PORT: parsePort(process.env.PORT, 3000),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: databaseUrl,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "",
  BACKEND_URL: process.env.BACKEND_URL,
  CRON_SECRET: process.env.CRON_SECRET || "",
  DATABASE_SSL_REJECT_UNAUTHORIZED: parseBoolean(
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED,
    process.env.NODE_ENV === "production",
  ),
};