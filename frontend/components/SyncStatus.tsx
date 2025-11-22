'use client';

import { useSyncStatus } from '@/lib/hooks/useSyncStatus';
import { useEffect } from 'react';
import { syncManager } from '@/lib/sync/SyncManager';

export function SyncStatus() {
    const { isOnline, isSyncing, pendingCount, failedCount, manualSync, retryFailed } = useSyncStatus();

    // Start auto-sync on mount
    useEffect(() => {
        syncManager.startAutoSync(30000); // Sync every 30 seconds

        return () => {
            syncManager.stopAutoSync();
        };
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[200px] border border-gray-200 dark:border-gray-700">
                {/* Online/Offline Status */}
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>

                {/* Sync Status */}
                {isSyncing && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Syncing...</span>
                    </div>
                )}

                {/* Pending Changes */}
                {pendingCount > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">{pendingCount}</span> pending change{pendingCount !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Failed Syncs */}
                {failedCount > 0 && (
                    <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                        <span className="font-medium">{failedCount}</span> failed sync{failedCount !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                    {isOnline && (
                        <button
                            onClick={manualSync}
                            disabled={isSyncing}
                            className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sync Now
                        </button>
                    )}

                    {failedCount > 0 && (
                        <button
                            onClick={retryFailed}
                            className="text-xs px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                        >
                            Retry
                        </button>
                    )}
                </div>

                {/* All Synced Indicator */}
                {isOnline && pendingCount === 0 && failedCount === 0 && !isSyncing && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>All synced</span>
                    </div>
                )}
            </div>
        </div>
    );
}
