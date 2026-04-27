import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.USER_SERVER_PORT || 4000;

export const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mora9s_2026"
};
