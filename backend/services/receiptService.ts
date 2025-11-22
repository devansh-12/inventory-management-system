import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

interface CreateReceiptParams {
    from_contact_id: number;
    to_warehouse_id: number;
    responsible_user_id: number;
    scheduled_date: string;
    items: {
        product_id: number;
        quantity: number;
        unit_cost: number;
    }[];
}

export const getAllReceipts = async () => {
    const receipts = await sql`
    SELECT 
      r.id, 
      r.reference, 
      r.status, 
      r.scheduled_date,
      c.name as contact_name,
      w.name as warehouse_name,
      u.name as responsible_user_name
    FROM receipts r
    LEFT JOIN contacts c ON r.from_contact_id = c.id
    LEFT JOIN warehouses w ON r.to_warehouse_id = w.id
    LEFT JOIN users u ON r.responsible_user_id = u.id
    ORDER BY r.created_at DESC
  `;
    return receipts;
};

export const createReceipt = async (params: CreateReceiptParams) => {
    // 1. Get warehouse short code
    const warehouseResult = await sql`
    SELECT short_code FROM warehouses WHERE id = ${params.to_warehouse_id}
  `;

    if (warehouseResult.length === 0) {
        throw new Error("Warehouse not found");
    }

    const warehouseShortCode = warehouseResult[0].short_code;

    // 2. Insert receipt with temporary reference
    // Note: Neon (serverless) doesn't support transactions in the same way as a persistent connection pool 
    // unless using the WebSocket driver or specific transaction endpoints. 
    // For simplicity with the HTTP driver, we'll do best-effort sequential operations.
    // If strict transactional integrity is needed, we should switch back to the WebSocket driver (Pool).

    const insertResult = await sql`
    INSERT INTO receipts (
      reference, 
      status, 
      from_contact_id, 
      to_warehouse_id, 
      responsible_user_id, 
      scheduled_date
    ) VALUES (
      'TEMP', 
      'Draft', 
      ${params.from_contact_id}, 
      ${params.to_warehouse_id}, 
      ${params.responsible_user_id}, 
      ${params.scheduled_date}
    ) RETURNING id
  `;

    const receiptId = insertResult[0].id;

    // 3. Generate proper reference: WH/IN/<ID>
    // Pad ID with leading zeros, e.g., 001
    const paddedId = receiptId.toString().padStart(3, '0');
    const reference = `${warehouseShortCode}/IN/${paddedId}`;

    await sql`
    UPDATE receipts SET reference = ${reference} WHERE id = ${receiptId}
  `;

    // 4. Insert items
    for (const item of params.items) {
        await sql`
      INSERT INTO receipt_items (
        receipt_id, 
        product_id, 
        quantity, 
        unit_cost
      ) VALUES (
        ${receiptId}, 
        ${item.product_id}, 
        ${item.quantity}, 
        ${item.unit_cost}
      )
    `;
    }

    return { id: receiptId, reference };
};
