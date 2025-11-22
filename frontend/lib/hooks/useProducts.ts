'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product, generateLocalId } from '../db';

/**
 * Offline-first hook for products
 */
export function useProducts() {
    // Live query - automatically updates when IndexedDB changes
    const products = useLiveQuery(() => db.products.toArray());
    const isLoading = products === undefined;

    const addProduct = async (product: Omit<Product, 'id' | '_synced' | '_local_id' | 'created_at' | 'updated_at'>) => {
        const localId = generateLocalId();
        const now = new Date();

        // Add to IndexedDB immediately
        const id = await db.products.add({
            ...product,
            _local_id: localId,
            _synced: false,
            created_at: now,
            updated_at: now
        });

        // Queue for sync
        await db.syncQueue.add({
            operation: 'CREATE',
            table: 'products',
            local_id: localId,
            payload: product,
            timestamp: now,
            status: 'pending',
            retry_count: 0
        });

        return id;
    };

    const updateProduct = async (id: number, changes: Partial<Product>) => {
        const now = new Date();

        await db.products.update(id, {
            ...changes,
            _synced: false,
            updated_at: now
        });

        await db.syncQueue.add({
            operation: 'UPDATE',
            table: 'products',
            record_id: id,
            payload: changes,
            timestamp: now,
            status: 'pending',
            retry_count: 0
        });
    };

    const deleteProduct = async (id: number) => {
        await db.products.delete(id);

        await db.syncQueue.add({
            operation: 'DELETE',
            table: 'products',
            record_id: id,
            payload: {},
            timestamp: new Date(),
            status: 'pending',
            retry_count: 0
        });
    };

    const getProductById = async (id: number) => {
        return await db.products.get(id);
    };

    const getProductBySku = async (sku: string) => {
        return await db.products.where('sku').equals(sku).first();
    };

    return {
        products: products || [],
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductBySku
    };
}
