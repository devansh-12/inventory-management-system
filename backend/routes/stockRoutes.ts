import { Router } from "express";
import * as stockController from "../controllers/stockController.js";
import auth from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", auth, stockController.getStock);
router.put("/:id", auth, stockController.updateStock);

export default router;
