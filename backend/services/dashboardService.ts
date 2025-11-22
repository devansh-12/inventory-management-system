import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

export const getDashboardStats = async () => {
    // Get receipt stats
    const receiptStats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'Draft') as draft,
      COUNT(*) FILTER (WHERE status IN ('Ready', 'Waiting')) as operations
    FROM receipts
  `;

    // Get delivery stats
    const deliveryStats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'Draft') as draft,
      COUNT(*) FILTER (WHERE status = 'Waiting') as waiting,
      COUNT(*) FILTER (WHERE status IN ('Ready', 'Done')) as operations
    FROM deliveries
  `;

    // Get stock count (warehouses)
    const stockStats = await sql`
    SELECT COUNT(DISTINCT warehouse_id) as warehouses
    FROM stock
  `;

    return {
        receipts: {
            total: Number(receiptStats[0].total),
            tasks: Number(receiptStats[0].draft),
            operations: Number(receiptStats[0].operations),
        },
        deliveries: {
            total: Number(deliveryStats[0].total),
            tasks: Number(deliveryStats[0].draft),
            waiting: Number(deliveryStats[0].waiting),
            operations: Number(deliveryStats[0].operations),
        },
        stock: {
            warehouses: Number(stockStats[0].warehouses),
        },
    };
};
