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
