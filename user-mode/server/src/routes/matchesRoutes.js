import express from "express";
import { getPool } from "../db.js";
import {
  applyMensSuperSixPlaceholderNames,
  isMensGroupStageComplete,
} from "../utils/mensGroupStage.js";

const router = express.Router();

// GET /api/matches
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const menGsComplete = await isMensGroupStageComplete(pool);
    const [rows] = await pool.query(`
      SELECT 
        m.*,
        t1.name AS team_1_name,
        t2.name AS team_2_name,
        g.name AS group_name,
        g.id AS group_id,
        r.team_1_score,
        r.team_2_score,
        r.result,
        r.penalty_score_team_1,
        r.penalty_score_team_2
      FROM matches m
      JOIN teams t1 ON m.team_1_id = t1.id
      JOIN teams t2 ON m.team_2_id = t2.id
      LEFT JOIN \`groups\` g ON m.group_id = g.id
      LEFT JOIN results r ON m.id = r.match_id
      ORDER BY m.id ASC
    `);
    res.json(rows.map((row) => applyMensSuperSixPlaceholderNames(row, menGsComplete)));
  } catch (err) {
    console.error("Error fetching matches", err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

export default router;
