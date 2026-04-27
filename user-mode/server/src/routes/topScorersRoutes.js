import express from "express";
import { getPool } from "../db.js";

const router = express.Router();

// Get top scorers with category filter
router.get("/api/top-scorers", async (req, res) => {
  try {
    const pool = getPool();
    const query = `
      SELECT 
        gs.player_name,
        t.name AS team_name,
        t.category,
        SUM(gs.goals_scored) AS total_goals
      FROM goal_scorers gs
      JOIN teams t ON gs.team_id = t.id
      GROUP BY gs.player_name, t.name, t.category
      ORDER BY total_goals DESC, gs.player_name ASC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching top scorers", err);
    res.status(500).json({ error: "Failed to fetch top scorers" });
  }
});

export default router;
