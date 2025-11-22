import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

// Warehouses
export const getAllWarehouses = async () => {
    const warehouses = await sql`
    SELECT id, name, short_code, address
    FROM warehouses
    ORDER BY name ASC
  `;
    return warehouses;
};

export const createWarehouse = async (params: {
    name: string;
    short_code: string;
    address?: string;
}) => {
    const result = await sql`
    INSERT INTO warehouses (name, short_code, address)
    VALUES (${params.name}, ${params.short_code}, ${params.address || null})
    RETURNING *
  `;
    return result[0];
};

export const updateWarehouse = async (params: {
    id: number;
    name?: string;
    short_code?: string;
    address?: string;
}) => {
    const result = await sql`
    UPDATE warehouses
    SET 
      name = COALESCE(${params.name}, name),
      short_code = COALESCE(${params.short_code}, short_code),
      address = COALESCE(${params.address}, address)
    WHERE id = ${params.id}
    RETURNING *
  `;
    return result[0];
};

export const deleteWarehouse = async (id: number) => {
    await sql`DELETE FROM warehouses WHERE id = ${id}`;
    return { success: true };
};

// Locations
export const getAllLocations = async () => {
    const locations = await sql`
    SELECT 
      l.id,
      l.name,
      l.short_code,
      l.warehouse_id,
      w.name as warehouse_name
    FROM locations l
    LEFT JOIN warehouses w ON l.warehouse_id = w.id
    ORDER BY l.name ASC
  `;
    return locations;
};

export const getLocationsByWarehouse = async (warehouseId: number) => {
    const locations = await sql`
    SELECT id, name, short_code, warehouse_id
    FROM locations
    WHERE warehouse_id = ${warehouseId}
    ORDER BY name ASC
  `;
    return locations;
};

export const createLocation = async (params: {
    name: string;
    short_code: string;
    warehouse_id: number;
}) => {
    const result = await sql`
    INSERT INTO locations (name, short_code, warehouse_id)
    VALUES (${params.name}, ${params.short_code}, ${params.warehouse_id})
    RETURNING *
  `;
    return result[0];
};

export const updateLocation = async (params: {
    id: number;
    name?: string;
    short_code?: string;
    warehouse_id?: number;
}) => {
    const result = await sql`
    UPDATE locations
    SET 
      name = COALESCE(${params.name}, name),
      short_code = COALESCE(${params.short_code}, short_code),
      warehouse_id = COALESCE(${params.warehouse_id}, warehouse_id)
    WHERE id = ${params.id}
    RETURNING *
  `;
    return result[0];
};

export const deleteLocation = async (id: number) => {
    await sql`DELETE FROM locations WHERE id = ${id}`;
    return { success: true };
};
