import express from "express";
import {
  getGoalScorers,
  getGoalScorersByMatch,
  createGoalScorer,
  updateGoalScorer,
  deleteGoalScorer
} from "../controllers/goalScorersController.js";
import { verifyAdminToken } from "../middleware/verifyAdminToken.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/goal-scorers", getGoalScorers);
router.get("/goal-scorers/match/:match_id", getGoalScorersByMatch);
router.post("/goal-scorers", createGoalScorer);
router.put("/goal-scorers/:id", updateGoalScorer);
router.delete("/goal-scorers/:id", deleteGoalScorer);

export default router;
