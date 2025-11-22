import { Request, Response } from "express";
import * as receiptService from "../services/receiptService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const getReceipts = async (req: Request, res: Response) => {
    try {
        const receipts = await receiptService.getAllReceipts();
        res.json(receipts);
    } catch (error) {
        console.error("Error fetching receipts:", error);
        res.status(500).json({ error: "Failed to fetch receipts" });
    }
};

export const createReceipt = async (req: Request, res: Response) => {
    try {
        const { from_contact_id, to_warehouse_id, scheduled_date, items } = req.body;

        // Assuming auth middleware populates req.user
        // We need to cast req to any or extend the Request type to include user
        const user = (req as AuthRequest).user;
        const responsible_user_id = (typeof user === 'object' && user !== null && 'id' in user) ? (user as any).id : null;

        if (!responsible_user_id) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        if (!from_contact_id || !to_warehouse_id || !scheduled_date || !items || !Array.isArray(items)) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await receiptService.createReceipt({
            from_contact_id,
            to_warehouse_id,
            responsible_user_id,
            scheduled_date,
            items
        });

        res.status(201).json(result);
    } catch (error: any) {
        console.error("Error creating receipt:", error);
        res.status(500).json({ error: error.message || "Failed to create receipt" });
    }
};
