'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, HelpCircle, Settings, User, LogOut, Warehouse, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { isAuthenticated, logout, getUser } from '@/lib/auth';

export default function WarehouseSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [warehouses, setWarehouses] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('mock_warehouses');
        return raw ? JSON.parse(raw) : [
          { id: 'wh-1', name: 'Central Warehouse', shortCode: 'WH', address: '12, Main St, City' },
        ];
      } catch (e) {
        return [
          { id: 'wh-1', name: 'Central Warehouse', shortCode: 'WH', address: '12, Main St, City' },
        ];
      }
    }
    return [
      { id: 'wh-1', name: 'Central Warehouse', shortCode: 'WH', address: '12, Main St, City' },
    ];
  });

  const [form, setForm] = useState({ name: '', shortCode: '', address: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      const userData = getUser();
      setUser(userData);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_warehouses', JSON.stringify(warehouses));
    }
  }, [warehouses]);

  function resetForm() {
    setForm({ name: '', shortCode: '', address: '' });
    setEditingId(null);
  }

  function handleAddOrUpdate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!form.name.trim() || !form.shortCode.trim()) return;

    if (editingId) {
      setWarehouses(w => w.map(x => x.id === editingId ? { ...x, ...form } : x));
    } else {
      setWarehouses(w => [...w, { id: `wh-${Date.now()}`, ...form }]);
    }
    resetForm();
  }

  function handleEdit(id: string) {
    const w = warehouses.find(x => x.id === id);
    if (!w) return;
    setForm({ name: w.name, shortCode: w.shortCode, address: w.address });
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this warehouse?')) return;
    setWarehouses(w => w.filter(x => x.id !== id));
  }

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
      <Sidebar active="settings" />

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

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => router.push('/settings')} className="p-2 rounded-md hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Warehouse className="w-6 h-6 text-orange-600" /> Warehouse Settings
              </h1>
            </div>

            {/* Form Card */}
            <form onSubmit={handleAddOrUpdate} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
                <p className="text-sm text-gray-500">Create or edit warehouses used in the system.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    value={form.shortCode}
                    onChange={e => setForm(f => ({ ...f, shortCode: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Warehouse'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>

            {/* List */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Warehouses</h3>

              <div className="divide-y divide-gray-200">
                {warehouses.map(w => (
                  <div key={w.id} className="flex items-center justify-between py-4">
                    <div>
                      <div className="font-medium text-gray-900">{w.name} <span className="text-xs text-gray-500">({w.shortCode})</span></div>
                      <div className="text-sm text-gray-500">{w.address}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(w.id)}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {warehouses.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-500">No warehouses yet — add one above.</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

