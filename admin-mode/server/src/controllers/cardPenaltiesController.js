import { getPool } from "../db.js";

export const getCardPenalties = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM card_penalties ORDER BY card_type");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching card penalties", err);
    res.status(500).json({ error: "Failed to fetch card penalties" });
  }
};

export const updateCardPenalty = async (req, res) => {
  const { id } = req.params;
  const { penalty_points, description } = req.body;
  try {
    const pool = getPool();
    await pool.query(
      "UPDATE card_penalties SET penalty_points = ?, description = ? WHERE id = ?",
      [penalty_points, description, id]
    );
    res.json({ id, penalty_points, description });
  } catch (err) {
    console.error("Error updating card penalty", err);
    res.status(500).json({ error: "Failed to update card penalty" });
  }
};
