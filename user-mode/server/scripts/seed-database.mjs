/**
 * Full tournament reset from database/seed.sql (same data as initial deploy).
 * Loads DB_* from user-mode/server/.env — run: npm run db:seed
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const seedPath = path.join(__dirname, "..", "..", "..", "database", "seed.sql");

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME || "mora9s_2026",
  multipleStatements: true,
};

if (!fs.existsSync(seedPath)) {
  console.error("seed.sql not found at:", seedPath);
  process.exit(1);
}

const sql = fs.readFileSync(seedPath, "utf8");

const conn = await mysql.createConnection(config);
try {
  await conn.query(`USE \`${config.database.replace(/`/g, "")}\``);
  try {
    await conn.query(
      "ALTER TABLE teams ADD COLUMN is_placeholder BOOLEAN DEFAULT FALSE"
    );
  } catch (e) {
    if (e.errno !== 1060) throw e;
  }
  await conn.query(`
    ALTER TABLE matches
    MODIFY COLUMN match_type ENUM(
      'group_stage', 'super6', 'semi_final', '3rd_place', 'final'
    ) DEFAULT 'group_stage'
  `);
  await conn.query(`
    ALTER TABLE card_penalties
    MODIFY COLUMN card_type ENUM('yellow', 'red', 'green') NOT NULL
  `);
  await conn.query(sql);
  console.log("Database seeded:", config.database);
  console.log("Note: admin_users was cleared — recreate admin accounts if needed.");
} finally {
  await conn.end();
}
