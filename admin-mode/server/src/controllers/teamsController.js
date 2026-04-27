import { getPool } from "../db.js";
import { emitToUsers } from "../utils/socket.js";

export const getTeams = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM teams");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching teams", err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

export const createTeam = async (req, res) => {
  const { name, group_id, category } = req.body;
  try {
    const pool = getPool();
    
    // Validate group exists if group_id is provided
    if (group_id) {
      const [groups] = await pool.query("SELECT id FROM `groups` WHERE id = ?", [group_id]);
      if (groups.length === 0) {
        return res.status(400).json({ error: `Group ID ${group_id} does not exist. Please create the group first or leave Group ID empty.` });
      }
    }
    
    const [result] = await pool.query(
      "INSERT INTO teams (name, group_id, category) VALUES (?, ?, ?)",
      [name, group_id || null, category || 'men']
    );
    const newTeam = { id: result.insertId, name, group_id, category };
    
    // Emit real-time update to user clients
    emitToUsers('team_created', newTeam);
    
    res.status(201).json(newTeam);
  } catch (err) {
    console.error("Error creating team", err);
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ error: "Invalid group ID. Please select an existing group or leave it empty." });
    } else {
      res.status(500).json({ error: "Failed to create team" });
    }
  }
};

export const updateTeam = async (req, res) => {
  const { id } = req.params;
  const { name, group_id, category } = req.body;
  try {
    const pool = getPool();
    
    // Validate group exists if group_id is provided
    if (group_id) {
      const [groups] = await pool.query("SELECT id FROM `groups` WHERE id = ?", [group_id]);
      if (groups.length === 0) {
        return res.status(400).json({ error: `Group ID ${group_id} does not exist. Please create the group first or leave Group ID empty.` });
      }
    }
    
    await pool.query(
      "UPDATE teams SET name = ?, group_id = ?, category = ? WHERE id = ?",
      [name, group_id || null, category || 'men', id]
    );
    const updatedTeam = { id, name, group_id, category };
    
    // Emit real-time update to user clients
    emitToUsers('team_updated', updatedTeam);
    
    res.json(updatedTeam);
  } catch (err) {
    console.error("Error updating team", err);
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ error: "Invalid group ID. Please select an existing group or leave it empty." });
    } else {
      res.status(500).json({ error: "Failed to update team" });
    }
  }
};

export const deleteTeam = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    await pool.query("DELETE FROM teams WHERE id = ?", [id]);
    
    // Emit real-time update to user clients
    emitToUsers('team_deleted', { id });
    
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting team", err);
    res.status(500).json({ error: "Failed to delete team" });
  }
};
