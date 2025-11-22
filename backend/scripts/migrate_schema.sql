-- Migration script generated from migrate_schema_enhanced.ts
-- Core tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'warehouse_staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  short_code VARCHAR(20) UNIQUE,
  address TEXT
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  short_code VARCHAR(20),
  warehouse_id INT REFERENCES warehouses(id)
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  sku VARCHAR(100) UNIQUE,
  category_id INT REFERENCES categories(id),
  unit_cost DECIMAL(10,2),
  description TEXT,
  unit_of_measure VARCHAR(20) DEFAULT 'Unit',
  reorder_level INT DEFAULT 0,
  max_level INT,
  barcode VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS stock (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  warehouse_id INT REFERENCES warehouses(id),
  location_id INT REFERENCES locations(id),
  on_hand INT,
  free_to_use INT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  contact_type VARCHAR(30),
  info TEXT
);

CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE,
  status VARCHAR(20),
  from_contact_id INT REFERENCES contacts(id),
  to_warehouse_id INT REFERENCES warehouses(id),
  responsible_user_id INT REFERENCES users(id),
  scheduled_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id SERIAL PRIMARY KEY,
  receipt_id INT REFERENCES receipts(id),
  product_id INT REFERENCES products(id),
  quantity INT,
  unit_cost DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE,
  status VARCHAR(20),
  from_warehouse_id INT REFERENCES warehouses(id),
  to_contact_id INT REFERENCES contacts(id),
  responsible_user_id INT REFERENCES users(id),
  scheduled_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_items (
  id SERIAL PRIMARY KEY,
  delivery_id INT REFERENCES deliveries(id),
  product_id INT REFERENCES products(id),
  quantity INT,
  unit_cost DECIMAL(10,2),
  alert_out_of_stock BOOLEAN
);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Auth related tables
CREATE TABLE IF NOT EXISTS verification_token (
  identifier VARCHAR(255),
  token VARCHAR(255),
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  purpose VARCHAR(50) DEFAULT 'email_verification',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  email VARCHAR(255) NOT NULL,
  token VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (email, token)
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state VARCHAR(255),
  UNIQUE (provider, provider_account_id)
);

-- Offline‑first extensions
CREATE TABLE IF NOT EXISTS transfers (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE,
  status VARCHAR(20) DEFAULT 'Draft',
  from_warehouse_id INT REFERENCES warehouses(id),
  to_warehouse_id INT REFERENCES warehouses(id),
  from_location_id INT REFERENCES locations(id),
  to_location_id INT REFERENCES locations(id),
  responsible_user_id INT REFERENCES users(id),
  scheduled_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfer_items (
  id SERIAL PRIMARY KEY,
  transfer_id INT REFERENCES transfers(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE,
  product_id INT REFERENCES products(id),
  warehouse_id INT REFERENCES warehouses(id),
  location_id INT REFERENCES locations(id),
  counted_quantity INT NOT NULL,
  system_quantity INT NOT NULL,
  difference INT NOT NULL,
  reason VARCHAR(100),
  notes TEXT,
  responsible_user_id INT REFERENCES users(id),
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reorder_rules (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  warehouse_id INT REFERENCES warehouses(id),
  min_quantity INT NOT NULL,
  max_quantity INT,
  preferred_supplier_id INT REFERENCES contacts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS stock_ledger (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  warehouse_id INT REFERENCES warehouses(id),
  location_id INT REFERENCES locations(id),
  quantity_change INT NOT NULL,
  quantity_after INT NOT NULL,
  operation_type VARCHAR(30),
  reference_id INT,
  reference_type VARCHAR(30),
  responsible_user_id INT REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_product ON stock(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_warehouse ON stock(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_location ON stock(location_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_product ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_warehouse ON stock_ledger(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_move_history_product ON move_history(product_id);
CREATE INDEX IF NOT EXISTS idx_move_history_event_type ON move_history(event_type);
