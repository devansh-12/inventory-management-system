import { db, SyncQueueItem, generateLocalId } from '../db';

export class SyncManager {
    private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : false;
    private syncInterval: NodeJS.Timeout | null = null;
    private isSyncing: boolean = false;
    private readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    constructor() {
        if (typeof window !== 'undefined') {
            // Listen for online/offline events
            window.addEventListener('online', () => this.handleOnline());
            window.addEventListener('offline', () => this.handleOffline());
        }
    }

    // ============================================
    // Public Methods
    // ============================================

    /**
     * Start automatic sync at specified interval
     */
    async startAutoSync(intervalMs: number = 30000) {
        console.log('[SyncManager] Starting auto-sync...');

        // Initial sync
        if (this.isOnline) {
            await this.syncAll();
        }

        // Set up periodic sync
        this.syncInterval = setInterval(async () => {
            if (this.isOnline && !this.isSyncing) {
                await this.syncAll();
            }
        }, intervalMs);
    }

    /**
     * Stop automatic sync
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('[SyncManager] Auto-sync stopped');
        }
    }

    /**
     * Manually trigger full sync
     */
    async syncAll(): Promise<void> {
        if (this.isSyncing) {
            console.log('[SyncManager] Sync already in progress, skipping...');
            return;
        }

        if (!this.isOnline) {
            console.log('[SyncManager] Offline, skipping sync');
            return;
        }

        try {
            this.isSyncing = true;
            console.log('[SyncManager] Starting full sync...');

            // Push local changes first
            await this.pushToServer();

            // Then pull server changes
            await this.pullFromServer();

            console.log('[SyncManager] Full sync completed');
        } catch (error) {
            console.error('[SyncManager] Sync failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Get pending sync count
     */
    async getPendingCount(): Promise<number> {
        return await db.syncQueue
            .where('status')
            .equals('pending')
            .count();
    }

    /**
     * Get failed sync count
     */
    async getFailedCount(): Promise<number> {
        return await db.syncQueue
            .where('status')
            .equals('failed')
            .count();
    }

    /**
     * Retry failed syncs
     */
    async retryFailed(): Promise<void> {
        const failed = await db.syncQueue
            .where('status')
            .equals('failed')
            .toArray();

        for (const item of failed) {
            await db.syncQueue.update(item.id!, {
                status: 'pending',
                retry_count: 0,
                error: undefined
            });
        }

        await this.pushToServer();
    }

    // ============================================
    // Private Methods - Push to Server
    // ============================================

    private async pushToServer(): Promise<void> {
        console.log('[SyncManager] Pushing changes to server...');

        const queue = await db.syncQueue
            .where('status')
            .equals('pending')
            .sortBy('timestamp');

        console.log(`[SyncManager] Found ${queue.length} pending items`);

        for (const item of queue) {
            await this.processSyncItem(item);
        }
    }

    private async processSyncItem(item: SyncQueueItem): Promise<void> {
        try {
            // Mark as syncing
            await db.syncQueue.update(item.id!, { status: 'syncing' });

            const method = this.getHttpMethod(item.operation);
            const url = this.buildUrl(item);

            console.log(`[SyncManager] ${method} ${url}`);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer default-secret' // TODO: Use real auth token
                },
                body: item.operation !== 'DELETE' ? JSON.stringify(item.payload) : undefined
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const serverData = await response.json();

            // Update local record with server ID if it was a CREATE operation
            if (item.operation === 'CREATE' && item.local_id) {
                await this.updateLocalId(item.table, item.local_id, serverData.id);
            }

            // Mark record as synced
            await this.markAsSynced(item.table, item.record_id || serverData.id);

            // Remove from queue
            await db.syncQueue.delete(item.id!);

            console.log(`[SyncManager] ✓ Synced ${item.table} ${item.operation}`);
        } catch (error: any) {
            console.error(`[SyncManager] ✗ Failed to sync ${item.table}:`, error.message);

            // Mark as failed
            await db.syncQueue.update(item.id!, {
                status: 'failed',
                retry_count: item.retry_count + 1,
                error: error.message
            });

            // If too many retries, log and skip
            if (item.retry_count >= 3) {
                console.error(`[SyncManager] Item failed after 3 retries, skipping:`, item);
            }
        }
    }

    private getHttpMethod(operation: string): string {
        switch (operation) {
            case 'CREATE': return 'POST';
            case 'UPDATE': return 'PUT';
            case 'DELETE': return 'DELETE';
            default: return 'GET';
        }
    }

    private buildUrl(item: SyncQueueItem): string {
        const base = `${this.API_BASE}/api/${item.table}`;

        if (item.operation === 'UPDATE' || item.operation === 'DELETE') {
            return `${base}/${item.record_id}`;
        }

        return base;
    }

    private async updateLocalId(table: string, localId: string, serverId: number): Promise<void> {
        const tableRef = (db as any)[table];
        if (!tableRef) return;

        const record = await tableRef.where('_local_id').equals(localId).first();
        if (record) {
            await tableRef.update(record.id, {
                id: serverId,
                _local_id: undefined
            });
        }
    }

    private async markAsSynced(table: string, id: number): Promise<void> {
        const tableRef = (db as any)[table];
        if (!tableRef) return;

        await tableRef.update(id, { _synced: true });
    }

    // ============================================
    // Private Methods - Pull from Server
    // ============================================

    private async pullFromServer(): Promise<void> {
        console.log('[SyncManager] Pulling changes from server...');

        try {
            // Get last sync time for each table
            const tables = [
                'products', 'categories', 'warehouses', 'locations',
                'stock', 'contacts', 'receipts', 'deliveries'
            ];

            for (const table of tables) {
                await this.pullTable(table);
            }
        } catch (error) {
            console.error('[SyncManager] Pull failed:', error);
        }
    }

    private async pullTable(tableName: string): Promise<void> {
        try {
            const metadata = await db.syncMetadata
                .where('table_name')
                .equals(tableName)
                .first();

            const lastSync = metadata?.last_pull || new Date(0);

            const response = await fetch(
                `${this.API_BASE}/api/${tableName}`,
                {
                    headers: {
                        'Authorization': 'Bearer default-secret' // TODO: Use real auth token
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch ${tableName}`);
            }

            const data = await response.json();
            const tableRef = (db as any)[tableName];

            if (!tableRef) {
                console.warn(`[SyncManager] Table ${tableName} not found in IndexedDB`);
                return;
            }

            // Merge data into IndexedDB
            for (const record of data) {
                const existing = await tableRef.get(record.id);

                if (existing) {
                    // Update if server version is newer
                    const serverTime = new Date(record.updated_at || record.created_at);
                    const localTime = new Date(existing.updated_at || existing.created_at);

                    if (serverTime > localTime && existing._synced) {
                        await tableRef.update(record.id, {
                            ...record,
                            _synced: true
                        });
                    }
                } else {
                    // Insert new record
                    await tableRef.add({
                        ...record,
                        _synced: true
                    });
                }
            }

            // Update sync metadata
            await db.syncMetadata.put({
                table_name: tableName,
                last_sync: new Date(),
                last_pull: new Date(),
                last_push: metadata?.last_push || new Date()
            });

            console.log(`[SyncManager] ✓ Pulled ${data.length} records from ${tableName}`);
        } catch (error: any) {
            console.error(`[SyncManager] Failed to pull ${tableName}:`, error.message);
        }
    }

    // ============================================
    // Event Handlers
    // ============================================

    private handleOnline() {
        console.log('[SyncManager] Connection restored, syncing...');
        this.isOnline = true;
        this.syncAll();
    }

    private handleOffline() {
        console.log('[SyncManager] Connection lost, working offline');
        this.isOnline = false;
    }
}

// Export singleton instance
export const syncManager = new SyncManager();
