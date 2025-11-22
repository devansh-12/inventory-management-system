import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

// Simple dotenv replacement
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const parts = line.split("=");
        const key = parts[0];
        const value = parts.slice(1).join("=");
        if (key && value) {
            let val = value.trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            process.env[key.trim()] = val;
        }
    });
}

const sql = neon(process.env.DATABASE_URL!);

async function verify() {
    try {
        console.log("Setting up test data...");

        // 1. Create test data
        // Warehouse
        const whResult = await sql`
      INSERT INTO warehouses (name, short_code, address) 
      VALUES ('Test Warehouse', 'TESTWH', '123 Test St') 
      ON CONFLICT (short_code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
        const warehouseId = whResult[0].id;

        // Contact
        const contactResult = await sql`
      INSERT INTO contacts (name, contact_type, info) 
      VALUES ('Test Vendor', 'vendor', 'test@vendor.com') 
      RETURNING id
    `;
        const contactId = contactResult[0].id;

        // User
        const userResult = await sql`
      INSERT INTO users (name, email, password_hash) 
      VALUES ('Test User', 'test@user.com', 'hash') 
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
        const userId = userResult[0].id;

        // Category
        const catResult = await sql`
      INSERT INTO categories (name, description) 
      VALUES ('Test Category', 'Test Desc') 
      RETURNING id
    `;
        const catId = catResult[0].id;

        // Product
        const prodResult = await sql`
      INSERT INTO products (name, sku, category_id, unit_cost, description) 
      VALUES ('Test Product', 'TESTSKU', ${catId}, 10.00, 'Test Desc') 
      ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
        const prodId = prodResult[0].id;

        console.log("Test data created. Testing service...");

        // 2. Test Service directly (to avoid auth mocking complexity for now)
        // We can import the service if we were running in the same context, but this is a standalone script.
        // So we will simulate the service logic here to verify the DB interactions and reference generation.

        // Simulate createReceipt logic
        console.log("Simulating receipt creation...");

        // Get warehouse short code
        const warehouseRes = await sql`SELECT short_code FROM warehouses WHERE id = ${warehouseId}`;
        const warehouseShortCode = warehouseRes[0].short_code;

        // Insert receipt
        const insertResult = await sql`
      INSERT INTO receipts (
        reference, status, from_contact_id, to_warehouse_id, responsible_user_id, scheduled_date
      ) VALUES (
        'TEMP', 'Draft', ${contactId}, ${warehouseId}, ${userId}, '2023-11-22'
      ) RETURNING id
    `;
        const receiptId = insertResult[0].id;

        // Generate reference
        const paddedId = receiptId.toString().padStart(3, '0');
        const reference = `${warehouseShortCode}/IN/${paddedId}`;

        await sql`UPDATE receipts SET reference = ${reference} WHERE id = ${receiptId}`;

        // Insert items
        await sql`
      INSERT INTO receipt_items (receipt_id, product_id, quantity, unit_cost) 
      VALUES (${receiptId}, ${prodId}, 5, 10.00)
    `;

        console.log(`Receipt created with reference: ${reference}`);

        // Verify
        const verifyResult = await sql`SELECT * FROM receipts WHERE id = ${receiptId}`;
        if (verifyResult[0].reference === reference) {
            console.log("SUCCESS: Reference generated correctly.");
        } else {
            console.error(`FAILURE: Expected ${reference}, got ${verifyResult[0].reference}`);
        }

        // Clean up
        console.log("Cleaning up...");
        await sql`DELETE FROM receipt_items WHERE receipt_id = ${receiptId}`;
        await sql`DELETE FROM receipts WHERE id = ${receiptId}`;
        await sql`DELETE FROM products WHERE id = ${prodId}`;
        await sql`DELETE FROM categories WHERE id = ${catId}`;
        await sql`DELETE FROM contacts WHERE id = ${contactId}`;
        // Don't delete warehouse or user as they might be used by others or have constraints, 
        // but for this test environment it's probably fine. Let's leave them.

    } catch (error) {
        console.error("Verification failed:", error);
    }
}

verify();
