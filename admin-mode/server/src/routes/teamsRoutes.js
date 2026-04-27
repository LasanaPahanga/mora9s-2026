import express from "express";
import { verifyAdminToken } from "../middleware/verifyAdminToken.js";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam
} from "../controllers/teamsController.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/", getTeams);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;
