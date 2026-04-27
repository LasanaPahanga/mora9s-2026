import express from "express";
import { getPool } from "../db.js";

const router = express.Router();

// GET /api/groups
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM `groups`");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching groups", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

export default router;
