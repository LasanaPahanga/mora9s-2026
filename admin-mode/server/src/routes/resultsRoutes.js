import express from "express";
import { verifyAdminToken } from "../middleware/verifyAdminToken.js";
import {
  getResults,
  createResult,
  updateResult,
  deleteResult
} from "../controllers/resultsController.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/", getResults);
router.post("/", createResult);
router.put("/:id", updateResult);
router.delete("/:id", deleteResult);

export default router;
