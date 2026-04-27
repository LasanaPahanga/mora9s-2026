import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Invalid token", err);
    res.status(401).json({ error: "Invalid token" });
  }
};
