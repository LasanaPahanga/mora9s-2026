import { getPool } from "../db.js";
import { emitToUsers } from "../utils/socket.js";
import { triggerAutoPromotion } from "./promotionController.js";

export const getResults = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        m.category,
        m.match_type,
        t1.name AS team_1_name,
        t2.name AS team_2_name
      FROM results r
      JOIN matches m ON r.match_id = m.id
      JOIN teams t1 ON m.team_1_id = t1.id
      JOIN teams t2 ON m.team_2_id = t2.id
      ORDER BY r.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching results", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

export const createResult = async (req, res) => {
  const { match_id, team_1_score, team_2_score, yellow_cards_team_1, red_cards_team_1, green_cards_team_1, yellow_cards_team_2, red_cards_team_2, green_cards_team_2, penalty_score_team_1, penalty_score_team_2 } = req.body;
  try {
    const pool = getPool();
    
    // Auto-calculate result based on scores and penalties
    let result = 'draw';
    if (team_1_score > team_2_score) {
      result = 'team_1_win';
    } else if (team_2_score > team_1_score) {
      result = 'team_2_win';
    } else if (team_1_score === team_2_score && penalty_score_team_1 != null && penalty_score_team_2 != null) {
      // If scores are equal but penalties were taken
      if (penalty_score_team_1 > penalty_score_team_2) {
        result = 'team_1_win';
      } else if (penalty_score_team_2 > penalty_score_team_1) {
        result = 'team_2_win';
      }
    }
    
    const [resultRow] = await pool.query(
      "INSERT INTO results (match_id, team_1_score, team_2_score, result, yellow_cards_team_1, red_cards_team_1, green_cards_team_1, yellow_cards_team_2, red_cards_team_2, green_cards_team_2, penalty_score_team_1, penalty_score_team_2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [match_id, team_1_score, team_2_score, result, yellow_cards_team_1 || 0, red_cards_team_1 || 0, green_cards_team_1 || 0, yellow_cards_team_2 || 0, red_cards_team_2 || 0, green_cards_team_2 || 0, penalty_score_team_1 ?? null, penalty_score_team_2 ?? null]
    );
    
      // Mark match as finished
      await pool.query("UPDATE matches SET status = 'finished' WHERE id = ?", [match_id]);
    
      // Trigger auto-promotion if threshold met
      await triggerAutoPromotion(match_id);
    const newResult = {
      id: resultRow.insertId,
      match_id,
      team_1_score,
      team_2_score,
      result,
      yellow_cards_team_1,
      red_cards_team_1,
      green_cards_team_1,
      yellow_cards_team_2,
      red_cards_team_2,
      green_cards_team_2,
      penalty_score_team_1,
      penalty_score_team_2
    };
    
    // Emit real-time update to user clients
    emitToUsers('result_created', newResult);
    
    res.status(201).json(newResult);
  } catch (err) {
    console.error("Error creating result", err);
    res.status(500).json({ error: "Failed to create result" });
  }
};

export const updateResult = async (req, res) => {
  const { id } = req.params;
  const { match_id, team_1_score, team_2_score, yellow_cards_team_1, red_cards_team_1, green_cards_team_1, yellow_cards_team_2, red_cards_team_2, green_cards_team_2, penalty_score_team_1, penalty_score_team_2 } = req.body;
  try {
    const pool = getPool();
    
    // Auto-calculate result based on scores and penalties
    let result = 'draw';
    if (team_1_score > team_2_score) {
      result = 'team_1_win';
    } else if (team_2_score > team_1_score) {
      result = 'team_2_win';
    } else if (team_1_score === team_2_score && penalty_score_team_1 != null && penalty_score_team_2 != null) {
      // If scores are equal but penalties were taken
      if (penalty_score_team_1 > penalty_score_team_2) {
        result = 'team_1_win';
      } else if (penalty_score_team_2 > penalty_score_team_1) {
        result = 'team_2_win';
      }
    }
    
    await pool.query(
      "UPDATE results SET match_id = ?, team_1_score = ?, team_2_score = ?, result = ?, yellow_cards_team_1 = ?, red_cards_team_1 = ?, green_cards_team_1 = ?, yellow_cards_team_2 = ?, red_cards_team_2 = ?, green_cards_team_2 = ?, penalty_score_team_1 = ?, penalty_score_team_2 = ? WHERE id = ?",
      [match_id, team_1_score, team_2_score, result, yellow_cards_team_1 || 0, red_cards_team_1 || 0, green_cards_team_1 || 0, yellow_cards_team_2 || 0, red_cards_team_2 || 0, green_cards_team_2 || 0, penalty_score_team_1 ?? null, penalty_score_team_2 ?? null, id]
    );
    
      // Mark match as finished if result is being updated
      await pool.query("UPDATE matches SET status = 'finished' WHERE id = ?", [match_id]);
    
      // Trigger auto-promotion if threshold met
      await triggerAutoPromotion(match_id);
    const updatedResult = { id, match_id, team_1_score, team_2_score, result, yellow_cards_team_1, red_cards_team_1, green_cards_team_1, yellow_cards_team_2, red_cards_team_2, green_cards_team_2, penalty_score_team_1, penalty_score_team_2 };
    
    // Emit real-time update to user clients
    emitToUsers('result_updated', updatedResult);
    
    res.json(updatedResult);
  } catch (err) {
    console.error("Error updating result", err);
    res.status(500).json({ error: "Failed to update result" });
  }
};

export const deleteResult = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    await pool.query("DELETE FROM results WHERE id = ?", [id]);
    
    // Emit real-time update to user clients
    emitToUsers('result_deleted', { id });
    
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting result", err);
    res.status(500).json({ error: "Failed to delete result" });
  }
};
