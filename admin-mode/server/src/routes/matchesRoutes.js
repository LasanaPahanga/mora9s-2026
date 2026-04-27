import express from "express";
import { verifyAdminToken } from "../middleware/verifyAdminToken.js";
import {
  getMatches,
  createMatch,
  updateMatch,
  deleteMatch
} from "../controllers/matchesController.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/", getMatches);
router.post("/", createMatch);
router.put("/:id", updateMatch);
router.delete("/:id", deleteMatch);

export default router;
