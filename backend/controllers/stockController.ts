import { Request, Response } from "express";
import * as stockService from "../services/stockService.js";

export const getStock = async (req: Request, res: Response) => {
    try {
        const { warehouse_id } = req.query;

        let stock;
        if (warehouse_id) {
            stock = await stockService.getStockByWarehouse(Number(warehouse_id));
        } else {
            stock = await stockService.getAllStock();
        }

        res.json(stock);
    } catch (error) {
        console.error("Error fetching stock:", error);
        res.status(500).json({ error: "Failed to fetch stock" });
    }
};

export const updateStock = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { on_hand, free_to_use } = req.body;

        if (on_hand === undefined && free_to_use === undefined) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const result = await stockService.updateStock({
            id: Number(id),
            on_hand,
            free_to_use,
        });

        res.json(result);
    } catch (error: any) {
        console.error("Error updating stock:", error);
        res.status(500).json({ error: error.message || "Failed to update stock" });
    }
};
