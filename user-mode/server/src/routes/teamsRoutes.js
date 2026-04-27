import express from "express";
import { getPool } from "../db.js";

const router = express.Router();

// GET /api/teams
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM teams");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching teams", err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

export default router;
