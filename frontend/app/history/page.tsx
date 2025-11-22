'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, HelpCircle, Settings, User, LogOut } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { isAuthenticated, logout, getUser } from '@/lib/auth';
import MoveHistoryHeader from './components/MoveHistoryHeader';
import MoveHistoryTable from './components/MoveHistoryTable';
import MoveHistoryKanban from './components/MoveHistoryKanban';
import type { MoveHistoryItem } from './types';

// Mock data for receipts and deliveries (in real app, this would come from API)
const mockReceipts = [
  {
    id: '1',
    reference: 'WH/IN/0001',
    from: 'Vendor A',
    to: 'WH/Stock1',
    contact: 'Azure Interior',
    scheduleDate: '2024-01-22',
    status: 'Done',
    responsible: 'John Smith',
    products: [
      { id: '1', productCode: 'DESK001', productName: 'Desk', quantity: 6 },
      { id: '2', productCode: 'CHAIR001', productName: 'Chair', quantity: 12 },
      { id: '3', productCode: 'CAB001', productName: 'Cabinet', quantity: 3 }
    ]
  },
  {
    id: '2',
    reference: 'WH/IN/0002',
    from: 'Vendor B',
    to: 'WH/Stock2',
    contact: 'Tech Solutions',
    scheduleDate: '2024-01-21',
    status: 'Done',
    responsible: 'Jane Smith',
    products: [
      { id: '4', productCode: 'TABLE001', productName: 'Table', quantity: 8 }
    ]
  },
  {
    id: '3',
    reference: 'WH/IN/0003',
    from: 'Vendor C',
    to: 'WH/Stock1',
    contact: 'Global Supplies',
    scheduleDate: '2024-01-20',
    status: 'Done',
    responsible: 'Mike Johnson',
    products: [
      { id: '5', productCode: 'SHELF001', productName: 'Shelf', quantity: 15 },
      { id: '6', productCode: 'LAMP001', productName: 'Lamp', quantity: 20 }
    ]
  }
];

const mockDeliveries = [
  {
    id: '1',
    reference: 'WH/OUT/0001',
    from: 'WH/Stock1',
    to: 'Customer A',
    contact: 'Azure Interior',
    scheduleDate: '2024-01-22',
    status: 'Done',
    responsible: 'Sarah Lee',
    products: [
      { id: '1', productCode: 'DESK001', productName: 'Desk', quantity: 4 },
      { id: '2', productCode: 'CHAIR001', productName: 'Chair', quantity: 8 }
    ]
  },
  {
    id: '2',
    reference: 'WH/OUT/0002',
    from: 'WH/Stock2',
    to: 'Customer B',
    contact: 'Tech Solutions',
    scheduleDate: '2024-01-21',
    status: 'Done',
    responsible: 'David Miller',
    products: [
      { id: '3', productCode: 'CAB001', productName: 'Cabinet', quantity: 2 },
      { id: '4', productCode: 'TABLE001', productName: 'Table', quantity: 5 },
      { id: '5', productCode: 'SHELF001', productName: 'Shelf', quantity: 10 }
    ]
  },
  {
    id: '3',
    reference: 'WH/OUT/0003',
    from: 'WH/Stock1',
    to: 'Customer C',
    contact: 'Global Supplies',
    scheduleDate: '2024-01-20',
    status: 'Done',
    responsible: 'Emily Brown',
    products: [
      { id: '6', productCode: 'LAMP001', productName: 'Lamp', quantity: 12 }
    ]
  }
];

// Generate move history from receipts and deliveries
function generateMoveHistory(): MoveHistoryItem[] {
  const historyItems: MoveHistoryItem[] = [];
  let itemId = 1;

  // Process receipts (IN moves - green)
  mockReceipts.forEach((receipt) => {
    if (receipt.status === 'Done' && receipt.products && receipt.products.length > 0) {
      receipt.products.forEach((product) => {
        historyItems.push({
          id: `receipt-${itemId++}`,
          reference: receipt.reference,
          product: product.productName,
          productCode: product.productCode,
          sku: product.productCode,
          from: receipt.from,
          to: receipt.to,
          quantity: product.quantity,
          date: receipt.scheduleDate ? `${receipt.scheduleDate} 14:30` : new Date().toISOString().split('T')[0] + ' 14:30',
          user: receipt.responsible || 'System',
          type: 'receipt',
          direction: 'in'
        });
      });
    }
  });

  // Process deliveries (OUT moves - red)
  mockDeliveries.forEach((delivery) => {
    if (delivery.status === 'Done' && delivery.products && delivery.products.length > 0) {
      delivery.products.forEach((product) => {
        historyItems.push({
          id: `delivery-${itemId++}`,
          reference: delivery.reference,
          product: product.productName,
          productCode: product.productCode,
          sku: product.productCode,
          from: delivery.from,
          to: delivery.to,
          quantity: product.quantity,
          date: delivery.scheduleDate ? `${delivery.scheduleDate} 11:15` : new Date().toISOString().split('T')[0] + ' 11:15',
          user: delivery.responsible || 'System',
          type: 'delivery',
          direction: 'out'
        });
      });
    }
  });

  // Add some transfer and adjustment examples
  historyItems.push(
    {
      id: `transfer-${itemId++}`,
      reference: 'WH/INT/0001',
      product: 'Copper Wire Roll',
      productCode: 'WIRE001',
      sku: 'SKU-9273',
      from: 'WH/Stock/A2',
      to: 'WH/Stock/B1',
      quantity: 20,
      date: '2024-01-21 16:45',
      user: 'Mike Johnson',
      type: 'transfer',
      direction: 'in'
    },
    {
      id: `adjustment-${itemId++}`,
      reference: 'WH/ADJ/0001',
      product: 'Valve Assembly',
      productCode: 'VALVE001',
      sku: 'SKU-7234',
      from: 'WH/Stock/B1',
      to: 'Virtual Loss',
      quantity: 2,
      date: '2024-01-21 09:20',
      user: 'Admin',
      type: 'adjustment',
      direction: 'out'
    }
  );

  // Sort by date (newest first)
  return historyItems.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [historyData, setHistoryData] = useState<MoveHistoryItem[]>([]);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      const userData = getUser();
      setUser(userData);
      setHistoryData(generateMoveHistory());
      setLoading(false);
    }
  }, [router]);

  // Filter history based on search query
  const filteredHistory = historyData.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.reference.toLowerCase().includes(query) ||
      item.product.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.productCode.toLowerCase().includes(query) ||
      item.user.toLowerCase().includes(query) ||
      item.from.toLowerCase().includes(query) ||
      item.to.toLowerCase().includes(query)
    );
  });

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
      <Sidebar active="history" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 h-16">
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for SKUs, products, documents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 ml-6">
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

        {/* History Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <MoveHistoryHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {viewMode === 'list' && (
            <MoveHistoryTable items={filteredHistory} />
          )}

          {viewMode === 'kanban' && (
            <MoveHistoryKanban items={filteredHistory} />
          )}
        </main>
      </div>
    </div>
  );
}
