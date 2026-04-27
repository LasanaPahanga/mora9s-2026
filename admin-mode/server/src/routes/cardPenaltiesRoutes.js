import express from "express";
import { getCardPenalties, updateCardPenalty } from "../controllers/cardPenaltiesController.js";
import { verifyAdminToken } from "../middleware/verifyAdminToken.js";

const router = express.Router();

router.use(verifyAdminToken);

router.get("/card-penalties", getCardPenalties);
router.put("/card-penalties/:id", updateCardPenalty);

export default router;
