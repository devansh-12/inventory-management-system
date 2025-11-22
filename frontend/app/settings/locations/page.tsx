'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, HelpCircle, Settings, User, LogOut, MapPin, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { isAuthenticated, logout, getUser } from '@/lib/auth';

export default function LocationSettingsPage() {
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
      } catch {
        return [
          { id: 'wh-1', name: 'Central Warehouse', shortCode: 'WH', address: '12, Main St, City' },
        ];
      }
    }
    return [
      { id: 'wh-1', name: 'Central Warehouse', shortCode: 'WH', address: '12, Main St, City' },
    ];
  });

  const [locations, setLocations] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('mock_locations');
        return raw ? JSON.parse(raw) : [
          { id: 'loc-1', name: 'Room A', shortCode: 'RMA', warehouseId: warehouses[0]?.id || null }
        ];
      } catch {
        return [
          { id: 'loc-1', name: 'Room A', shortCode: 'RMA', warehouseId: warehouses[0]?.id || null }
        ];
      }
    }
    return [
      { id: 'loc-1', name: 'Room A', shortCode: 'RMA', warehouseId: warehouses[0]?.id || null }
    ];
  });

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
      localStorage.setItem('mock_locations', JSON.stringify(locations));
    }
  }, [locations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_warehouses', JSON.stringify(warehouses));
    }
  }, [warehouses]);

  const [form, setForm] = useState({ name: '', shortCode: '', warehouseId: warehouses[0]?.id || '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (warehouses.length > 0 && !form.warehouseId) {
      setForm(f => ({ ...f, warehouseId: warehouses[0].id }));
    }
  }, [warehouses]);

  function handleAddLocation(e?: React.FormEvent) {
    e?.preventDefault();
    if (!form.name || !form.warehouseId) return;
    if (editingId) {
      setLocations(l => l.map(x => x.id === editingId ? { ...x, ...form } : x));
    } else {
      setLocations(l => [...l, { id: `loc-${Date.now()}`, ...form }]);
    }
    setForm({ name: '', shortCode: '', warehouseId: warehouses[0]?.id || '' });
    setEditingId(null);
  }

  function handleEdit(id: string) {
    const s = locations.find(x => x.id === id);
    if (!s) return;
    setForm({ name: s.name, shortCode: s.shortCode, warehouseId: s.warehouseId });
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this location?')) return;
    setLocations(l => l.filter(x => x.id !== id));
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
                <MapPin className="w-6 h-6 text-emerald-600" /> Location Settings
              </h1>
            </div>

            <form onSubmit={handleAddLocation} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Location' : 'Add Location'}</h2>
                <p className="text-sm text-gray-500">Rooms, racks or zones inside warehouses.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    value={form.shortCode}
                    onChange={e => setForm(f => ({ ...f, shortCode: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse <span className="text-red-500">*</span></label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    value={form.warehouseId}
                    onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}
                    required
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.shortCode})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Location'}
                </button>
                <button
                  type="button"
                  onClick={() => { setForm({ name: '', shortCode: '', warehouseId: warehouses[0]?.id || '' }); setEditingId(null); }}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Locations</h3>

              <div className="divide-y divide-gray-200">
                {locations.map(loc => {
                  const wh = warehouses.find(w => w.id === loc.warehouseId);
                  return (
                    <div key={loc.id} className="flex items-center justify-between py-4">
                      <div>
                        <div className="font-medium text-gray-900">{loc.name} <span className="text-xs text-gray-500">({loc.shortCode})</span></div>
                        <div className="text-sm text-gray-500">Warehouse: {wh ? `${wh.name} (${wh.shortCode})` : '—'}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(loc.id)}
                          className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(loc.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {locations.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-500">No locations yet — add one above.</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
