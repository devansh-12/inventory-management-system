import { Router } from "express";
import * as receiptController from "../controllers/receiptController.js";
import auth from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", auth, receiptController.getReceipts);
router.post("/", auth, receiptController.createReceipt);

export default router;
