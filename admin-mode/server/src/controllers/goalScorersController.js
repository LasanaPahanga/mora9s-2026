import { getPool } from "../db.js";
import { emitToUsers } from "../utils/socket.js";

export const getGoalScorers = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM goal_scorers");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching goal scorers", err);
    res.status(500).json({ error: "Failed to fetch goal scorers" });
  }
};

export const getGoalScorersByMatch = async (req, res) => {
  const { match_id } = req.params;
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT * FROM goal_scorers WHERE match_id = ?",
      [match_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching goal scorers", err);
    res.status(500).json({ error: "Failed to fetch goal scorers" });
  }
};

export const createGoalScorer = async (req, res) => {
  const { match_id, player_name, team_id, goals_scored } = req.body;
  try {
    const pool = getPool();
    const [result] = await pool.query(
      "INSERT INTO goal_scorers (match_id, player_name, team_id, goals_scored) VALUES (?, ?, ?, ?)",
      [match_id, player_name, team_id, goals_scored || 1]
    );
    const newGoalScorer = {
      id: result.insertId,
      match_id,
      player_name,
      team_id,
      goals_scored: goals_scored || 1
    };
    
    // Emit real-time update to user clients
    emitToUsers('goal_scorer_created', newGoalScorer);
    
    res.status(201).json(newGoalScorer);
  } catch (err) {
    console.error("Error creating goal scorer", err);
    res.status(500).json({ error: "Failed to create goal scorer" });
  }
};

export const updateGoalScorer = async (req, res) => {
  const { id } = req.params;
  const { match_id, player_name, team_id, goals_scored } = req.body;
  try {
    const pool = getPool();
    await pool.query(
      "UPDATE goal_scorers SET match_id = ?, player_name = ?, team_id = ?, goals_scored = ? WHERE id = ?",
      [match_id, player_name, team_id, goals_scored || 1, id]
    );
    const updatedGoalScorer = { id, match_id, player_name, team_id, goals_scored };
    
    // Emit real-time update to user clients
    emitToUsers('goal_scorer_updated', updatedGoalScorer);
    
    res.json(updatedGoalScorer);
  } catch (err) {
    console.error("Error updating goal scorer", err);
    res.status(500).json({ error: "Failed to update goal scorer" });
  }
};

export const deleteGoalScorer = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    await pool.query("DELETE FROM goal_scorers WHERE id = ?", [id]);
    
    // Emit real-time update to user clients
    emitToUsers('goal_scorer_deleted', { id });
    
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting goal scorer", err);
    res.status(500).json({ error: "Failed to delete goal scorer" });
  }
};
