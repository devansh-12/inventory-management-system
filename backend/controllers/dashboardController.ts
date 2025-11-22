import { Request, Response } from "express";
import * as dashboardService from "../services/dashboardService.js";

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await dashboardService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};
