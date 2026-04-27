import { getPool } from "../db.js";
import { emitToUsers } from "../utils/socket.js";

export const getGroups = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM `groups`");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching groups", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

export const createGroup = async (req, res) => {
  const { name, description, category } = req.body;
  try {
    const pool = getPool();
    const [result] = await pool.query(
      "INSERT INTO `groups` (name, description, category) VALUES (?, ?, ?)",
      [name, description, category || 'men']
    );
    const newGroup = { id: result.insertId, name, description, category };
    
    // Emit real-time update to user clients
    emitToUsers('group_created', newGroup);
    
    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Error creating group", err);
    res.status(500).json({ error: "Failed to create group" });
  }
};

export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description, category } = req.body;
  try {
    const pool = getPool();
    await pool.query(
      "UPDATE `groups` SET name = ?, description = ?, category = ? WHERE id = ?",
      [name, description, category || 'men', id]
    );
    const updatedGroup = { id, name, description, category };
    
    // Emit real-time update to user clients
    emitToUsers('group_updated', updatedGroup);
    
    res.json(updatedGroup);
  } catch (err) {
    console.error("Error updating group", err);
    res.status(500).json({ error: "Failed to update group" });
  }
};

export const deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    await pool.query("DELETE FROM `groups` WHERE id = ?", [id]);
    
    // Emit real-time update to user clients
    emitToUsers('group_deleted', { id });
    
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting group", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
};
