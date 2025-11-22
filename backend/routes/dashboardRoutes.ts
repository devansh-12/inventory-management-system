import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import auth from "../middleware/authMiddleware.js";

const router = Router();

router.get("/stats", auth, dashboardController.getDashboardStats);

export default router;
