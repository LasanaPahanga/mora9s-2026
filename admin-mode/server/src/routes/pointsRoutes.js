import express from "express";
import { verifyAdminToken } from "../middleware/verifyAdminToken.js";
import {
  getPoints,
  createPointsRow,
  updatePointsRow,
  deletePointsRow
} from "../controllers/pointsController.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/", getPoints);
router.post("/", createPointsRow);
router.put("/:id", updatePointsRow);
router.delete("/:id", deletePointsRow);

export default router;
