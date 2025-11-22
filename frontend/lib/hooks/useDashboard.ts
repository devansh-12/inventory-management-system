import { useState, useEffect } from 'react';
import { Package, Truck, RefreshCw, FileText, AlertTriangle } from 'lucide-react';

export interface DashboardData {
    kpis: {
        label: string;
        value: string | number;
        change: string;
        trend: 'up' | 'down' | 'neutral';
        period: string;
    }[];
    recentActivity: {
        type: 'receipt' | 'delivery' | 'transfer' | 'adjustment' | 'alert';
        action: string;
        user: string;
        time: string;
        icon?: any; // Will map icon component in UI
        color?: string; // Will map color in UI
    }[];
    alerts: {
        sku: string;
        product: string;
        location: string;
        priority: 'high' | 'medium' | 'low';
        issue: string;
    }[];
    warehouses: {
        name: string;
        stock: string | number;
        lowStock: number;
        operations: number;
        status: 'normal' | 'high' | 'low';
    }[];
    fastMoving: {
        name: string;
        sku: string;
        moved: number;
        trend: string;
    }[];
}

export function useDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`);
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }
                const result = await response.json();
                setData(result);
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return { data, isLoading, error };
}
