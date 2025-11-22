import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sql = neon(process.env.DATABASE_URL!);

async function addColumns() {
    console.log("Adding new columns to existing tables...");

    try {
        // Add columns to products table one by one
        const productColumns = [
            { name: 'unit_of_measure', type: 'VARCHAR(20)', default: "'Unit'" },
            { name: 'reorder_level', type: 'INT', default: '0' },
            { name: 'max_level', type: 'INT', default: 'NULL' },
            { name: 'barcode', type: 'VARCHAR(100)', default: 'NULL' }
        ];

        for (const col of productColumns) {
            try {
                await sql`SELECT unit_of_measure FROM products LIMIT 1`.catch(async () => {
                    console.log(`Adding products.${col.name}...`);
                    const query = `ALTER TABLE products ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`;
                    await sql.unsafe(query);
                });
            } catch (e: any) {
                if (!e.message.includes('already exists')) {
                    console.log(`Column ${col.name} might already exist or error:`, e.message);
                }
            }
        }

        // Add role column to users
        try {
            await sql`SELECT role FROM users LIMIT 1`.catch(async () => {
                console.log("Adding users.role...");
                await sql.unsafe("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'warehouse_staff'");
            });
        } catch (e: any) {
            if (!e.message.includes('already exists')) {
                console.log("Column role might already exist or error:", e.message);
            }
        }

        console.log("Column additions completed!");
    } catch (error) {
        console.error("Error adding columns:", error);
    }
}

addColumns();
