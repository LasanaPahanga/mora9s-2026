import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.ADMIN_SERVER_PORT || 5000;

export const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mora9s_2026"
};

export const JWT_SECRET = process.env.JWT_SECRET || "changeme-secret";
export const JWT_EXPIRES_IN = "1d";

/** Comma-separated origins for admin SPA (Vercel prod + local Vite). Override on EC2 if needed. */
export function getAdminCorsOrigins() {
  const raw = process.env.ADMIN_CORS_ORIGINS;
  if (raw && raw.trim()) {
    return raw.split(",").map((o) => o.trim()).filter(Boolean);
  }
  return [
    "https://admin.mora9s.live",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ];
}
