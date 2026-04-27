import express from "express";
import { verifyAdminToken } from "../middleware/verifyAdminToken.js";
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup
} from "../controllers/groupsController.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/", getGroups);
router.post("/", createGroup);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

export default router;
