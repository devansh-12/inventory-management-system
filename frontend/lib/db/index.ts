import Dexie, { Table } from 'dexie';

// ============================================
// Type Definitions (Mirror Postgres Schema)
// ============================================

export interface Product {
    id?: number;
    name: string;
    sku: string;
    category_id?: number;
    unit_cost: number;
    description?: string;
    unit_of_measure: string;
    reorder_level: number;
    max_level?: number;
    barcode?: string;
    _synced: boolean;
    _local_id?: string; // For offline-created records
    created_at: Date;
    updated_at: Date;
}

export interface Category {
    id?: number;
    name: string;
    description?: string;
    _synced: boolean;
    _local_id?: string;
}

export interface Warehouse {
    id?: number;
    name: string;
    short_code: string;
    address?: string;
    _synced: boolean;
    _local_id?: string;
}

export interface Location {
    id?: number;
    name: string;
    short_code: string;
    warehouse_id: number;
    _synced: boolean;
    _local_id?: string;
}

export interface Stock {
    id?: number;
    product_id: number;
    warehouse_id: number;
    location_id?: number;
    on_hand: number;
    free_to_use: number;
    updated_at: Date;
    _synced: boolean;
}

export interface Contact {
    id?: number;
    name: string;
    contact_type: 'vendor' | 'customer';
    info?: string;
    _synced: boolean;
    _local_id?: string;
}

export interface Receipt {
    id?: number;
    reference: string;
    status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
    from_contact_id?: number;
    to_warehouse_id?: number;
    responsible_user_id?: number;
    scheduled_date?: Date;
    created_at: Date;
    updated_at: Date;
    _synced: boolean;
    _local_id?: string;
}

export interface ReceiptItem {
    id?: number;
    receipt_id: number;
    product_id: number;
    quantity: number;
    unit_cost: number;
    _synced: boolean;
    _local_id?: string;
}

export interface Delivery {
    id?: number;
    reference: string;
    status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
    from_warehouse_id?: number;
    to_contact_id?: number;
    responsible_user_id?: number;
    scheduled_date?: Date;
    created_at: Date;
    updated_at: Date;
    _synced: boolean;
    _local_id?: string;
}

export interface DeliveryItem {
    id?: number;
    delivery_id: number;
    product_id: number;
    quantity: number;
    unit_cost: number;
    alert_out_of_stock: boolean;
    _synced: boolean;
    _local_id?: string;
}

export interface Transfer {
    id?: number;
    reference: string;
    status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
    from_warehouse_id?: number;
    to_warehouse_id?: number;
    from_location_id?: number;
    to_location_id?: number;
    responsible_user_id?: number;
    scheduled_date?: Date;
    notes?: string;
    created_at: Date;
    updated_at: Date;
    _synced: boolean;
    _local_id?: string;
}

export interface TransferItem {
    id?: number;
    transfer_id: number;
    product_id: number;
    quantity: number;
    _synced: boolean;
    _local_id?: string;
}

export interface StockAdjustment {
    id?: number;
    reference: string;
    product_id: number;
    warehouse_id: number;
    location_id?: number;
    counted_quantity: number;
    system_quantity: number;
    difference: number;
    reason?: string;
    notes?: string;
    responsible_user_id?: number;
    date: Date;
    created_at: Date;
    _synced: boolean;
    _local_id?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: Date;
}

export interface SyncQueueItem {
    id?: number;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    table: string;
    record_id?: number;
    local_id?: string;
    payload: any;
    timestamp: Date;
    status: 'pending' | 'syncing' | 'failed' | 'success';
    retry_count: number;
    error?: string;
}

export interface SyncMetadata {
    id?: number;
    table_name: string;
    last_sync: Date;
    last_pull: Date;
    last_push: Date;
}

// ============================================
// Dexie Database Class
// ============================================

export class IMSDatabase extends Dexie {
    // Tables
    products!: Table<Product>;
    categories!: Table<Category>;
    warehouses!: Table<Warehouse>;
    locations!: Table<Location>;
    stock!: Table<Stock>;
    contacts!: Table<Contact>;
    receipts!: Table<Receipt>;
    receiptItems!: Table<ReceiptItem>;
    deliveries!: Table<Delivery>;
    deliveryItems!: Table<DeliveryItem>;
    transfers!: Table<Transfer>;
    transferItems!: Table<TransferItem>;
    adjustments!: Table<StockAdjustment>;
    users!: Table<User>;
    syncQueue!: Table<SyncQueueItem>;
    syncMetadata!: Table<SyncMetadata>;

    constructor() {
        super('IMSDatabase');

        this.version(1).stores({
            // Products & Categories
            products: '++id, sku, category_id, _synced, _local_id',
            categories: '++id, name, _synced, _local_id',

            // Warehouses & Locations
            warehouses: '++id, short_code, _synced, _local_id',
            locations: '++id, warehouse_id, short_code, _synced, _local_id',

            // Stock
            stock: '++id, product_id, warehouse_id, location_id, _synced',

            // Contacts
            contacts: '++id, contact_type, _synced, _local_id',

            // Receipts (Incoming)
            receipts: '++id, reference, status, _synced, _local_id',
            receiptItems: '++id, receipt_id, product_id, _synced, _local_id',

            // Deliveries (Outgoing)
            deliveries: '++id, reference, status, _synced, _local_id',
            deliveryItems: '++id, delivery_id, product_id, _synced, _local_id',

            // Transfers (Internal)
            transfers: '++id, reference, status, _synced, _local_id',
            transferItems: '++id, transfer_id, product_id, _synced, _local_id',

            // Adjustments
            adjustments: '++id, reference, product_id, warehouse_id, _synced, _local_id',

            // Users (cached)
            users: '++id, email',

            // Sync Management
            syncQueue: '++id, status, timestamp, table, local_id',
            syncMetadata: '++id, table_name, last_sync'
        });
    }
}

// Export singleton instance
export const db = new IMSDatabase();

// Helper function to generate local IDs
export function generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to check if online
export function isOnline(): boolean {
    return navigator.onLine;
}
