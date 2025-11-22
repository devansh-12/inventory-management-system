import { Router } from "express";
import * as contactController from "../controllers/contactController.js";
import auth from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", auth, contactController.getContacts);

export default router;
