'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncManager } from '../sync/SyncManager';

/**
 * Hook to track online/offline status and sync state
 */
export function useSyncStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const [isSyncing, setIsSyncing] = useState(false);

    // Live query for pending sync count
    const pendingCount = useLiveQuery(
        () => db.syncQueue.where('status').equals('pending').count()
    );

    const failedCount = useLiveQuery(
        () => db.syncQueue.where('status').equals('failed').count()
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const manualSync = async () => {
        setIsSyncing(true);
        try {
            await syncManager.syncAll();
        } finally {
            setIsSyncing(false);
        }
    };

    const retryFailed = async () => {
        await syncManager.retryFailed();
    };

    return {
        isOnline,
        isSyncing,
        pendingCount: pendingCount || 0,
        failedCount: failedCount || 0,
        manualSync,
        retryFailed
    };
}
