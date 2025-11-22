'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, HelpCircle, Settings, User, LogOut } from 'lucide-react';
import { isAuthenticated, logout, getUser } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

// Type Definitions
interface StockItem {
  id: string;
  product: string;
  perUnitCost: string;
  onHand: number;
  freeToUse: number;
  warehouse?: string;
  location?: string;
}

export default function StockPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

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
  
  // Stock data with warehouse details
  const [stockData, setStockData] = useState<StockItem[]>([
    {
      id: '1',
      product: 'Desk',
      perUnitCost: '3000 Rs',
      onHand: 50,
      freeToUse: 45,
      warehouse: 'WH/Stock1',
      location: 'Aisle 1, Shelf 3',
    },
    {
      id: '2',
      product: 'Table',
      perUnitCost: '3000 Rs',
      onHand: 50,
      freeToUse: 50,
      warehouse: 'WH/Stock1',
      location: 'Aisle 2, Shelf 1',
    },
    {
      id: '3',
      product: 'Chair',
      perUnitCost: '2500 Rs',
      onHand: 75,
      freeToUse: 70,
      warehouse: 'WH/Stock2',
      location: 'Aisle 1, Shelf 2',
    },
    {
      id: '4',
      product: 'Cabinet',
      perUnitCost: '5000 Rs',
      onHand: 30,
      freeToUse: 25,
      warehouse: 'WH/Stock1',
      location: 'Aisle 3, Shelf 1',
    },
  ]);

  const [editForm, setEditForm] = useState<StockItem>({
    id: '',
    product: '',
    perUnitCost: '',
    onHand: 0,
    freeToUse: 0,
    warehouse: '',
    location: '',
  });

  const [newItem, setNewItem] = useState<StockItem>({
    id: '',
    product: '',
    perUnitCost: '',
    onHand: 0,
    freeToUse: 0,
    warehouse: '',
    location: '',
  });

  // Handle edit
  const handleEdit = (item: StockItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  // Handle save
  const handleSave = () => {
    if (!editForm.product || !editForm.perUnitCost) {
      alert('Please fill in all required fields');
      return;
    }

    if (editForm.freeToUse > editForm.onHand) {
      alert('Free to Use cannot be greater than On Hand');
      return;
    }

    setStockData(prevData =>
      prevData.map(item =>
        item.id === editingId ? { ...editForm } : item
      )
    );
    setEditingId(null);
    setEditForm({
      id: '',
      product: '',
      perUnitCost: '',
      onHand: 0,
      freeToUse: 0,
      warehouse: '',
      location: '',
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      id: '',
      product: '',
      perUnitCost: '',
      onHand: 0,
      freeToUse: 0,
      warehouse: '',
      location: '',
    });
  };

  // Handle add new item
  const handleAddNew = () => {
    if (!newItem.product || !newItem.perUnitCost) {
      alert('Please fill in all required fields');
      return;
    }

    if (newItem.freeToUse > newItem.onHand) {
      alert('Free to Use cannot be greater than On Hand');
      return;
    }

    const newStockItem: StockItem = {
      ...newItem,
      id: (stockData.length + 1).toString(),
      warehouse: newItem.warehouse || 'WH/Stock1',
      location: newItem.location || '',
    };

    setStockData([...stockData, newStockItem]);
    setIsAddingNew(false);
    setNewItem({
      id: '',
      product: '',
      perUnitCost: '',
      onHand: 0,
      freeToUse: 0,
      warehouse: '',
      location: '',
    });
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setStockData(prevData => prevData.filter(item => item.id !== id));
    }
  };

  // Parse cost string to number (remove "Rs" and commas)
  const parseCost = (costStr: string): number => {
    return parseInt(costStr.replace(/[Rs,\s]/g, '')) || 0;
  };

  // Format number to cost string
  const formatCost = (cost: number): string => {
    return `${cost.toLocaleString()} Rs`;
  };

  // Show loading state while checking authentication
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
      <Sidebar active="stock" />

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

        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Stock</h1>
            <p className="text-sm text-gray-600 mt-1">
              This page contains the warehouse details & location.
            </p>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Stock Inventory</h2>
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Per Unit Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      On Hand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Free to Use
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Warehouse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Add New Row */}
                  {isAddingNew && (
                    <tr className="bg-blue-50">
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={newItem.product}
                          onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                          placeholder="Product name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={newItem.perUnitCost}
                          onChange={(e) => setNewItem({ ...newItem, perUnitCost: e.target.value })}
                          placeholder="e.g., 3000 Rs"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={newItem.onHand || ''}
                          onChange={(e) => setNewItem({ ...newItem, onHand: parseInt(e.target.value) || 0 })}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={newItem.freeToUse || ''}
                          onChange={(e) => setNewItem({ ...newItem, freeToUse: parseInt(e.target.value) || 0 })}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={newItem.warehouse || ''}
                          onChange={(e) => setNewItem({ ...newItem, warehouse: e.target.value })}
                          placeholder="e.g., WH/Stock1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={newItem.location || ''}
                          onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                          placeholder="e.g., Aisle 1, Shelf 3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleAddNew}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingNew(false);
                              setNewItem({
                                id: '',
                                product: '',
                                perUnitCost: '',
                                onHand: 0,
                                freeToUse: 0,
                                warehouse: '',
                                location: '',
                              });
                            }}
                            className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Existing Rows */}
                  {stockData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {editingId === item.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.product}
                              onChange={(e) => setEditForm({ ...editForm, product: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.perUnitCost}
                              onChange={(e) => setEditForm({ ...editForm, perUnitCost: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editForm.onHand}
                              onChange={(e) => setEditForm({ ...editForm, onHand: parseInt(e.target.value) || 0 })}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editForm.freeToUse}
                              onChange={(e) => setEditForm({ ...editForm, freeToUse: parseInt(e.target.value) || 0 })}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.warehouse || ''}
                              onChange={(e) => setEditForm({ ...editForm, warehouse: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.location || ''}
                              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleSave}
                                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.product}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{item.perUnitCost}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{item.onHand}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              item.freeToUse < item.onHand * 0.2 
                                ? 'text-red-600' 
                                : item.freeToUse < item.onHand * 0.5 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                            }`}>
                              {item.freeToUse}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{item.warehouse || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{item.location || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {stockData.length === 0 && !isAddingNew && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No stock items found. Click "Add New Product" to get started.</p>
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Products</h3>
              <p className="text-2xl font-bold text-gray-900">{stockData.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total On Hand</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stockData.reduce((sum, item) => sum + item.onHand, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Free to Use</h3>
              <p className="text-2xl font-bold text-green-600">
                {stockData.reduce((sum, item) => sum + item.freeToUse, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}