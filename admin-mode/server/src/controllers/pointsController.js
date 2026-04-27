import { getPool } from "../db.js";

export const getPoints = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM points");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching points", err);
    res.status(500).json({ error: "Failed to fetch points" });
  }
};

export const createPointsRow = async (req, res) => {
  const { team_id, played, won, drawn, lost, points } = req.body;
  try {
    const pool = getPool();
    const [insert] = await pool.query(
      `INSERT INTO points (team_id, played, won, drawn, lost, points)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [team_id, played || 0, won || 0, drawn || 0, lost || 0, points || 0]
    );
    res.status(201).json({
      id: insert.insertId,
      team_id,
      played,
      won,
      drawn,
      lost,
      points
    });
  } catch (err) {
    console.error("Error creating points row", err);
    res.status(500).json({ error: "Failed to create points row" });
  }
};

export const updatePointsRow = async (req, res) => {
  const { id } = req.params;
  const { team_id, played, won, drawn, lost, points } = req.body;
  try {
    const pool = getPool();
    await pool.query(
      `UPDATE points
       SET team_id = ?, played = ?, won = ?, drawn = ?, lost = ?, points = ?
       WHERE id = ?`,
      [team_id, played, won, drawn, lost, points, id]
    );
    res.json({ id, team_id, played, won, drawn, lost, points });
  } catch (err) {
    console.error("Error updating points row", err);
    res.status(500).json({ error: "Failed to update points row" });
  }
};

export const deletePointsRow = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    await pool.query("DELETE FROM points WHERE id = ?", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting points row", err);
    res.status(500).json({ error: "Failed to delete points row" });
  }
};
