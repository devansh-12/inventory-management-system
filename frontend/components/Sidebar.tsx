'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, BarChart3, Truck, Box, Clock, Settings, Activity, FileText, ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
}

interface OperationsSubItem {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
}

interface SidebarProps {
    active: string;
}

const operationsSubItems: OperationsSubItem[] = [
    { id: 'receipts', label: 'Receipts', icon: Package, path: '/receipts' },
    { id: 'delivery', label: 'Delivery', icon: Truck, path: '/delivery' },
    { id: 'adjustment', label: 'Adjustment', icon: FileText, path: '/adjustment' },
];

const mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'stock', label: 'Stock', icon: Box, path: '/stock' },
    { id: 'history', label: 'Move History', icon: Clock, path: '/history' },
];

export default function Sidebar({ active }: SidebarProps) {
    const router = useRouter();
    const [isOperationsOpen, setIsOperationsOpen] = useState(false);

    // Check if any operations sub-item is active
    const isOperationsActive = operationsSubItems.some(item => active === item.id);

    const handleNavClick = (path: string) => {
        router.push(path);
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">InventoryMS</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {/* Dashboard */}
                <button
                    onClick={() => handleNavClick('/dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active === 'dashboard'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <BarChart3 className="w-5 h-5" />
                    Dashboard
                </button>

                {/* Operations Dropdown */}
                <div>
                    <button
                        onClick={() => setIsOperationsOpen(!isOperationsOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isOperationsActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5" />
                            Operations
                        </div>
                        {isOperationsOpen ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                    
                    {isOperationsOpen && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                            {operationsSubItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        active === item.id
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stock */}
                <button
                    onClick={() => handleNavClick('/stock')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active === 'stock'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <Box className="w-5 h-5" />
                    Stock
                </button>

                {/* Move History */}
                <button
                    onClick={() => handleNavClick('/history')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active === 'history'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <Clock className="w-5 h-5" />
                    Move History
                </button>
            </nav>

            {/* Settings at the bottom */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => handleNavClick('/settings')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active === 'settings'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <Settings className="w-5 h-5" />
                    Settings
                </button>
            </div>
        </aside>
    );
}
