import { getPool } from "../db.js";
import { emitToUsers } from "../utils/socket.js";

export const getMatches = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        m.*,
        t1.name AS team_1_name,
        t2.name AS team_2_name,
        g.name AS group_name
      FROM matches m
      JOIN teams t1 ON m.team_1_id = t1.id
      JOIN teams t2 ON m.team_2_id = t2.id
      LEFT JOIN \`groups\` g ON m.group_id = g.id
      ORDER BY m.id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching matches", err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
};

export const createMatch = async (req, res) => {
  const {
    group_id,
    team_1_id,
    team_2_id,
    status,
    category,
    match_type
  } = req.body;

  try {
    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO matches (group_id, team_1_id, team_2_id, status, category, match_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        group_id,
        team_1_id,
        team_2_id,
        status || "scheduled",
        category || "men",
        match_type || "group_stage"
      ]
    );
    const newMatch = {
      id: result.insertId,
      group_id,
      team_1_id,
      team_2_id,
      status,
      category,
      match_type
    };
    
    // Emit real-time update to user clients
    emitToUsers('match_created', newMatch);
    
    res.status(201).json(newMatch);
  } catch (err) {
    console.error("Error creating match", err);
    res.status(500).json({ error: "Failed to create match" });
  }
};

export const updateMatch = async (req, res) => {
  const { id } = req.params;
  const {
    group_id,
    team_1_id,
    team_2_id,
    status,
    category,
    match_type
  } = req.body;

  try {
    const pool = getPool();
    await pool.query(
      `UPDATE matches
       SET group_id = ?, team_1_id = ?, team_2_id = ?, status = ?, category = ?, match_type = ?
       WHERE id = ?`,
      [
        group_id,
        team_1_id,
        team_2_id,
        status,
        category || "men",
        match_type || "group_stage",
        id
      ]
    );
    const updatedMatch = {
      id,
      group_id,
      team_1_id,
      team_2_id,
      status,
      category,
      match_type
    };
    
    // Emit real-time update to user clients
    emitToUsers('match_updated', updatedMatch);
    
    res.json(updatedMatch);
  } catch (err) {
    console.error("Error updating match", err);
    res.status(500).json({ error: "Failed to update match" });
  }
};

export const deleteMatch = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    await pool.query("DELETE FROM matches WHERE id = ?", [id]);
    
    // Emit real-time update to user clients
    emitToUsers('match_deleted', { id });
    
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting match", err);
    res.status(500).json({ error: "Failed to delete match" });
  }
};
