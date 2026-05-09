import express from "express";
import { verifyAdminToken } from "../middleware/verifyAdminToken.js";
import { generateSuper6 } from "../controllers/super6Controller.js";

const router = express.Router();

router.use(verifyAdminToken);

router.post("/generate", generateSuper6);

export default router;
