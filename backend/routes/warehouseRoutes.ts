import { Router } from "express";
import * as warehouseController from "../controllers/warehouseController.js";
import auth from "../middleware/authMiddleware.js";

const router = Router();

// Warehouse routes
router.get("/warehouses", auth, warehouseController.getWarehouses);
router.post("/warehouses", auth, warehouseController.createWarehouse);
router.put("/warehouses/:id", auth, warehouseController.updateWarehouse);
router.delete("/warehouses/:id", auth, warehouseController.deleteWarehouse);

// Location routes
router.get("/locations", auth, warehouseController.getLocations);
router.post("/locations", auth, warehouseController.createLocation);
router.put("/locations/:id", auth, warehouseController.updateLocation);
router.delete("/locations/:id", auth, warehouseController.deleteLocation);

export default router;
