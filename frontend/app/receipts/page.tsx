'use client';

import { useState } from 'react';
import { Search, Bell, HelpCircle, Settings, User, Package, Warehouse, FileText, Activity, BarChart3, Box, Clock, List, LayoutGrid, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Type Definitions
interface Receipt {
  id: string;
  reference: string;
  from: string;
  to: string;
  contact: string;
  scheduleDate: string | null;
  status: 'Ready' | 'Draft' | 'In Progress' | 'Done' | 'Cancelled';
}

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface TopNavItem {
  id: string;
  label: string;
}

export default function ReceiptsPage() {
  const [activeNav, setActiveNav] = useState<string>('receipt');
  const [activeTopNav, setActiveTopNav] = useState<string>('operations');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedReceiptId, setDraggedReceiptId] = useState<string | null>(null);

  // Dummy data for receipts - using state so it can be updated
  const [receiptsData, setReceiptsData] = useState<Receipt[]>([
    { id: '1', reference: 'WH/IN/0001', from: 'vendor', to: 'WH/Stock1', contact: 'Azure Interior', scheduleDate: null, status: 'Ready' },
    { id: '2', reference: 'WH/IN/0002', from: 'vendor', to: 'WH/Stock1', contact: 'Azure Interior', scheduleDate: null, status: 'Ready' },
    { id: '3', reference: 'WH/IN/0003', from: 'vendor', to: 'WH/Stock2', contact: 'Tech Solutions', scheduleDate: '2024-01-15', status: 'In Progress' },
    { id: '4', reference: 'WH/IN/0004', from: 'vendor', to: 'WH/Stock1', contact: 'Global Supplies', scheduleDate: '2024-01-16', status: 'Draft' },
    { id: '5', reference: 'WH/IN/0005', from: 'vendor', to: 'WH/Stock3', contact: 'Azure Interior', scheduleDate: '2024-01-17', status: 'Ready' },
    { id: '6', reference: 'WH/IN/0006', from: 'vendor', to: 'WH/Stock2', contact: 'Tech Solutions', scheduleDate: null, status: 'Done' },
    { id: '7', reference: 'WH/IN/0007', from: 'vendor', to: 'WH/Stock1', contact: 'Global Supplies', scheduleDate: '2024-01-18', status: 'Ready' },
    { id: '8', reference: 'WH/IN/0008', from: 'vendor', to: 'WH/Stock3', contact: 'Azure Interior', scheduleDate: null, status: 'In Progress' },
  ]);

  const navItems: NavItem[] = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'receipt', icon: Package, label: 'Receipt Operations' },
    { id: 'delivery', icon: Package, label: 'Delivery Operations' },
    { id: 'stock', icon: Box, label: 'Stock' },
    { id: 'warehouse', icon: Warehouse, label: 'Warehouse' },
    { id: 'operations', icon: Activity, label: 'Dashboard Operations' },
    { id: 'history', icon: Clock, label: 'Move History' },
    { id: 'support', icon: HelpCircle, label: 'Support' },
  ];


  // Filter receipts based on search query (reference & contact)
  const filteredReceipts = receiptsData.filter(receipt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      receipt.reference.toLowerCase().includes(query) ||
      receipt.contact.toLowerCase().includes(query)
    );
  });

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, receiptId: string) => {
    setDraggedReceiptId(receiptId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Receipt['status']) => {
    e.preventDefault();
    if (draggedReceiptId) {
      setReceiptsData(prevReceipts =>
        prevReceipts.map(receipt =>
          receipt.id === draggedReceiptId
            ? { ...receipt, status: newStatus }
            : receipt
        )
      );
      setDraggedReceiptId(null);
    }
  };

  // Group receipts by status for Kanban view
  const groupedByStatus = {
    'Ready': filteredReceipts.filter(r => r.status === 'Ready'),
    'Draft': filteredReceipts.filter(r => r.status === 'Draft'),
    'In Progress': filteredReceipts.filter(r => r.status === 'In Progress'),
    'Done': filteredReceipts.filter(r => r.status === 'Done'),
    'Cancelled': filteredReceipts.filter(r => r.status === 'Cancelled'),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Done':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">InventoryMS</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeNav === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

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
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Receipts Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Receipts Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                NEW
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search Icon */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reference or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-100 text-gray-900"
                />
              </div>
              
              {/* View Toggle Icons */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'kanban'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Kanban View"
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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">From</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">To</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Schedule date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReceipts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No receipts found
                        </td>
                      </tr>
                    ) : (
                      filteredReceipts.map((receipt) => (
                        <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{receipt.reference}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{receipt.from}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{receipt.to}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{receipt.contact}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{receipt.scheduleDate || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(receipt.status)}`}>
                              {receipt.status}
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
              {Object.entries(groupedByStatus).map(([status, receipts]) => (
                <div
                  key={status}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status as Receipt['status'])}
                >
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">{status}</h3>
                    <span className="text-xs text-gray-500">{receipts.length} items</span>
                  </div>
                  <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {receipts.map((receipt) => (
                      <div
                        key={receipt.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, receipt.id)}
                        className={`bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-move ${
                          draggedReceiptId === receipt.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-900 mb-1">{receipt.reference}</div>
                        <div className="text-xs text-gray-600 mb-2">{receipt.contact}</div>
                        <div className="text-xs text-gray-500">
                          <div>From: {receipt.from}</div>
                          <div>To: {receipt.to}</div>
                          {receipt.scheduleDate && (
                            <div className="mt-1">Date: {receipt.scheduleDate}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {receipts.length === 0 && (
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

