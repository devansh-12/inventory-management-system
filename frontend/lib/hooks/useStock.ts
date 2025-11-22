'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Stock, generateLocalId } from '../db';

/**
 * Offline-first hook for stock management
 */
export function useStock() {
    const stock = useLiveQuery(() =>
        db.stock
            .toArray()
            .then(items =>
                Promise.all(
                    items.map(async (item) => {
                        const product = await db.products.get(item.product_id);
                        const warehouse = await db.warehouses.get(item.warehouse_id);
                        const location = item.location_id ? await db.locations.get(item.location_id) : null;

                        return {
                            ...item,
                            product_name: product?.name,
                            product_sku: product?.sku,
                            warehouse_name: warehouse?.name,
                            location_name: location?.name
                        };
                    })
                )
            )
    );

    const isLoading = stock === undefined;

    const updateStock = async (id: number, changes: { on_hand?: number; free_to_use?: number }) => {
        const now = new Date();

        await db.stock.update(id, {
            ...changes,
            updated_at: now,
            _synced: false
        });

        await db.syncQueue.add({
            operation: 'UPDATE',
            table: 'stock',
            record_id: id,
            payload: changes,
            timestamp: now,
            status: 'pending',
            retry_count: 0
        });
    };

    const getStockByProduct = async (productId: number) => {
        return await db.stock.where('product_id').equals(productId).toArray();
    };

    const getStockByWarehouse = async (warehouseId: number) => {
        return await db.stock.where('warehouse_id').equals(warehouseId).toArray();
    };

    const getLowStock = async () => {
        const allStock = await db.stock.toArray();
        const lowStockItems = [];

        for (const item of allStock) {
            const product = await db.products.get(item.product_id);
            if (product && item.on_hand <= product.reorder_level) {
                lowStockItems.push({
                    ...item,
                    product_name: product.name,
                    reorder_level: product.reorder_level
                });
            }
        }

        return lowStockItems;
    };

    return {
        stock: stock || [],
        isLoading,
        updateStock,
        getStockByProduct,
        getStockByWarehouse,
        getLowStock
    };
}
