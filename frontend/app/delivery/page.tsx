'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, HelpCircle, Settings, User, Package, Warehouse, FileText, Activity, BarChart3, Box, Clock, List, LayoutGrid, Plus, Truck, LogOut } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { isAuthenticated, logout, getUser } from '@/lib/auth';

// Type Definitions
interface Delivery {
    id: string;
    reference: string;
    destination: string;
    source: string;
    contact: string;
    scheduleDate: string | null;
    status: 'Ready' | 'Draft' | 'In Progress' | 'Done' | 'Cancelled';
}

export default function DeliveryPage() {
    const router = useRouter();
    const [activeNav, setActiveNav] = useState<string>('delivery');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedDeliveryId, setDraggedDeliveryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    // Check authentication on mount
    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
        } else {
            const userData = getUser();
            setUser(userData);
            setLoading(false);
        }
    }, [router]);

    // Dummy data for deliveries
    const [deliveriesData, setDeliveriesData] = useState<Delivery[]>([
        { id: '1', reference: 'WH/OUT/0001', destination: 'Customer A', source: 'WH/Stock', contact: 'Azure Interior', scheduleDate: null, status: 'Ready' },
        { id: '2', reference: 'WH/OUT/0002', destination: 'Customer B', source: 'WH/Stock', contact: 'Gemini Furniture', scheduleDate: '2024-01-20', status: 'In Progress' },
        { id: '3', reference: 'WH/OUT/0003', destination: 'Customer C', source: 'WH/Stock', contact: 'Deco Addict', scheduleDate: '2024-01-21', status: 'Draft' },
        { id: '4', reference: 'WH/OUT/0004', destination: 'Customer A', source: 'WH/Stock', contact: 'Azure Interior', scheduleDate: '2024-01-22', status: 'Ready' },
        { id: '5', reference: 'WH/OUT/0005', destination: 'Customer D', source: 'WH/Stock', contact: 'Lumber Inc', scheduleDate: null, status: 'Done' },
    ]);

    // Filter deliveries based on search query
    const filteredDeliveries = deliveriesData.filter(delivery => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            delivery.reference.toLowerCase().includes(query) ||
            delivery.contact.toLowerCase().includes(query) ||
            delivery.destination.toLowerCase().includes(query)
        );
    });

    // Handle drag and drop
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedDeliveryId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, newStatus: Delivery['status']) => {
        e.preventDefault();
        if (draggedDeliveryId) {
            setDeliveriesData(prev =>
                prev.map(item =>
                    item.id === draggedDeliveryId
                        ? { ...item, status: newStatus }
                        : item
                )
            );
            setDraggedDeliveryId(null);
        }
    };

    // Group by status for Kanban view
    const groupedByStatus = {
        'Draft': filteredDeliveries.filter(r => r.status === 'Draft'),
        'Ready': filteredDeliveries.filter(r => r.status === 'Ready'),
        'In Progress': filteredDeliveries.filter(r => r.status === 'In Progress'),
        'Done': filteredDeliveries.filter(r => r.status === 'Done'),
        'Cancelled': filteredDeliveries.filter(r => r.status === 'Cancelled'),
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ready': return 'bg-green-100 text-green-800 border-green-200';
            case 'Draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Done': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h1 className="text-xl font-semibold text-gray-700">Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            {/* Sidebar */}
            <Sidebar active="delivery" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <header className="bg-white border-b border-gray-200 px-6 py-3">
                    <div className="flex items-center justify-end">
                        <div className="flex items-center gap-3">
                            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <HelpCircle className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <Settings className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                {user && (
                                    <div className="hidden md:block text-sm">
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Delivery Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                NEW
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Delivery Orders</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-100 text-gray-900"
                                />
                            </div>

                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`p-2 rounded transition-colors ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reference</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Destination</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Source</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Schedule Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredDeliveries.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                    No delivery orders found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDeliveries.map((delivery) => (
                                                <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{delivery.reference}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-700">{delivery.destination}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-700">{delivery.source}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-700">{delivery.contact}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{delivery.scheduleDate || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                                                            {delivery.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Kanban View */}
                    {viewMode === 'kanban' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {Object.entries(groupedByStatus).map(([status, items]) => (
                                <div
                                    key={status}
                                    className="bg-white rounded-lg border border-gray-200 p-4"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, status as Delivery['status'])}
                                >
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">{status}</h3>
                                        <span className="text-xs text-gray-500">{items.length} items</span>
                                    </div>
                                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, item.id)}
                                                className={`bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-move ${draggedDeliveryId === item.id ? 'opacity-50' : ''
                                                    }`}
                                            >
                                                <div className="text-xs font-medium text-gray-900 mb-1">{item.reference}</div>
                                                <div className="text-xs text-gray-600 mb-2">{item.contact}</div>
                                                <div className="text-xs text-gray-500">
                                                    <div>To: {item.destination}</div>
                                                    {item.scheduleDate && (
                                                        <div className="mt-1">Date: {item.scheduleDate}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {items.length === 0 && (
                                            <div className="text-xs text-gray-400 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                Drop here
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
