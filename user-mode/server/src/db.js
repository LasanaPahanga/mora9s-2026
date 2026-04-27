import mysql from "mysql2/promise";
import { DB_CONFIG } from "./config/env.js";

let pool;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 10
    });
  }
  return pool;
};
