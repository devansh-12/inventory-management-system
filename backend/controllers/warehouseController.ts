import { Request, Response } from "express";
import * as warehouseService from "../services/warehouseService.js";

// Warehouses
export const getWarehouses = async (req: Request, res: Response) => {
    try {
        const warehouses = await warehouseService.getAllWarehouses();
        res.json(warehouses);
    } catch (error) {
        console.error("Error fetching warehouses:", error);
        res.status(500).json({ error: "Failed to fetch warehouses" });
    }
};

export const createWarehouse = async (req: Request, res: Response) => {
    try {
        const { name, short_code, address } = req.body;

        if (!name || !short_code) {
            return res.status(400).json({ error: "Name and short_code are required" });
        }

        const result = await warehouseService.createWarehouse({ name, short_code, address });
        res.status(201).json(result);
    } catch (error: any) {
        console.error("Error creating warehouse:", error);
        res.status(500).json({ error: error.message || "Failed to create warehouse" });
    }
};

export const updateWarehouse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, short_code, address } = req.body;

        const result = await warehouseService.updateWarehouse({
            id: Number(id),
            name,
            short_code,
            address,
        });

        res.json(result);
    } catch (error: any) {
        console.error("Error updating warehouse:", error);
        res.status(500).json({ error: error.message || "Failed to update warehouse" });
    }
};

export const deleteWarehouse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await warehouseService.deleteWarehouse(Number(id));
        res.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting warehouse:", error);
        res.status(500).json({ error: error.message || "Failed to delete warehouse" });
    }
};

// Locations
export const getLocations = async (req: Request, res: Response) => {
    try {
        const { warehouse_id } = req.query;

        let locations;
        if (warehouse_id) {
            locations = await warehouseService.getLocationsByWarehouse(Number(warehouse_id));
        } else {
            locations = await warehouseService.getAllLocations();
        }

        res.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).json({ error: "Failed to fetch locations" });
    }
};

export const createLocation = async (req: Request, res: Response) => {
    try {
        const { name, short_code, warehouse_id } = req.body;

        if (!name || !short_code || !warehouse_id) {
            return res.status(400).json({ error: "Name, short_code, and warehouse_id are required" });
        }

        const result = await warehouseService.createLocation({ name, short_code, warehouse_id });
        res.status(201).json(result);
    } catch (error: any) {
        console.error("Error creating location:", error);
        res.status(500).json({ error: error.message || "Failed to create location" });
    }
};

export const updateLocation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, short_code, warehouse_id } = req.body;

        const result = await warehouseService.updateLocation({
            id: Number(id),
            name,
            short_code,
            warehouse_id,
        });

        res.json(result);
    } catch (error: any) {
        console.error("Error updating location:", error);
        res.status(500).json({ error: error.message || "Failed to update location" });
    }
};

export const deleteLocation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await warehouseService.deleteLocation(Number(id));
        res.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting location:", error);
        res.status(500).json({ error: error.message || "Failed to delete location" });
    }
};
