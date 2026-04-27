import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPool } from "../db.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT * FROM admin_users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Login failed" });
  }
};
