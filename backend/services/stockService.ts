import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

export const getAllStock = async () => {
    const stock = await sql`
    SELECT 
      s.id,
      p.name as product_name,
      p.sku,
      p.unit_cost as per_unit_cost,
      s.on_hand,
      s.free_to_use,
      w.name as warehouse_name,
      l.name as location_name,
      s.updated_at
    FROM stock s
    LEFT JOIN products p ON s.product_id = p.id
    LEFT JOIN warehouses w ON s.warehouse_id = w.id
    LEFT JOIN locations l ON s.location_id = l.id
    ORDER BY p.name ASC
  `;
    return stock;
};

export const getStockByWarehouse = async (warehouseId: number) => {
    const stock = await sql`
    SELECT 
      s.id,
      p.name as product_name,
      p.sku,
      p.unit_cost as per_unit_cost,
      s.on_hand,
      s.free_to_use,
      w.name as warehouse_name,
      l.name as location_name,
      s.updated_at
    FROM stock s
    LEFT JOIN products p ON s.product_id = p.id
    LEFT JOIN warehouses w ON s.warehouse_id = w.id
    LEFT JOIN locations l ON s.location_id = l.id
    WHERE s.warehouse_id = ${warehouseId}
    ORDER BY p.name ASC
  `;
    return stock;
};

export const updateStock = async (params: {
    id: number;
    on_hand?: number;
    free_to_use?: number;
}) => {
    if (params.on_hand !== undefined && params.free_to_use !== undefined) {
        const result = await sql`
      UPDATE stock 
      SET on_hand = ${params.on_hand}, 
          free_to_use = ${params.free_to_use},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `;
        return result[0];
    } else if (params.on_hand !== undefined) {
        const result = await sql`
      UPDATE stock 
      SET on_hand = ${params.on_hand},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `;
        return result[0];
    } else if (params.free_to_use !== undefined) {
        const result = await sql`
      UPDATE stock 
      SET free_to_use = ${params.free_to_use},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `;
        return result[0];
    } else {
        throw new Error("No fields to update");
    }
};
