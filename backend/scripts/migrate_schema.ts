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

const schema = `
-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  short_code VARCHAR(20) UNIQUE,
  address TEXT
);

-- Locations
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  short_code VARCHAR(20),
  warehouse_id INT REFERENCES warehouses(id)
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  sku VARCHAR(100) UNIQUE,
  category_id INT REFERENCES categories(id),
  unit_cost DECIMAL(10,2),
  description TEXT
);

-- Stock
CREATE TABLE IF NOT EXISTS stock (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  warehouse_id INT REFERENCES warehouses(id),
  location_id INT REFERENCES locations(id),
  on_hand INT,
  free_to_use INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  contact_type VARCHAR(30),
  info TEXT
);

-- Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE,
  status VARCHAR(20),
  from_contact_id INT REFERENCES contacts(id),
  to_warehouse_id INT REFERENCES warehouses(id),
  responsible_user_id INT REFERENCES users(id),
  scheduled_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipt Items
CREATE TABLE IF NOT EXISTS receipt_items (
  id SERIAL PRIMARY KEY,
  receipt_id INT REFERENCES receipts(id),
  product_id INT REFERENCES products(id),
  quantity INT,
  unit_cost DECIMAL(10,2)
);

-- Deliveries
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE,
  status VARCHAR(20),
  from_warehouse_id INT REFERENCES warehouses(id),
  to_contact_id INT REFERENCES contacts(id),
  responsible_user_id INT REFERENCES users(id),
  scheduled_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Items
CREATE TABLE IF NOT EXISTS delivery_items (
  id SERIAL PRIMARY KEY,
  delivery_id INT REFERENCES deliveries(id),
  product_id INT REFERENCES products(id),
  quantity INT,
  unit_cost DECIMAL(10,2),
  alert_out_of_stock BOOLEAN
);

-- Move History
CREATE TABLE IF NOT EXISTS move_history (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50),
  contact_id INT REFERENCES contacts(id),
  from_warehouse_id INT REFERENCES warehouses(id),
  to_warehouse_id INT REFERENCES warehouses(id),
  from_location_id INT REFERENCES locations(id),
  to_location_id INT REFERENCES locations(id),
  product_id INT REFERENCES products(id),
  quantity INT,
  status VARCHAR(20),
  event_type VARCHAR(20),
  responsible_user_id INT REFERENCES users(id),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function migrate() {
    try {
        console.log("Starting migration...");
        // Split schema into individual statements
        const statements = schema.split(";").map(s => s.trim()).filter(s => s.length > 0);

        for (const [index, statement] of statements.entries()) {
            console.log(`Executing statement ${index + 1}/${statements.length}...`);
            const query = [statement] as any;
            query.raw = [statement];
            await sql(query);
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrate();
