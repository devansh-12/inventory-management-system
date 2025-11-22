'use client';

import { useProducts } from '@/lib/hooks';
import { SyncStatus } from '@/components/SyncStatus';
import { useState } from 'react';

export default function ProductsPage() {
    const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        unit_cost: 0,
        unit_of_measure: 'Unit',
        reorder_level: 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addProduct(formData);
        setFormData({
            name: '',
            sku: '',
            unit_cost: 0,
            unit_of_measure: 'Unit',
            reorder_level: 0
        });
        setShowForm(false);
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <SyncStatus />

            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Products (Offline-First)</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {showForm ? 'Cancel' : 'Add Product'}
                    </button>
                </div>

                {/* Add Product Form */}
                {showForm && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                        <h2 className="text-xl font-semibold mb-4">New Product</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">SKU</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unit Cost</label>
                                    <input
                                        type="number"
                                        value={formData.unit_cost}
                                        onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unit of Measure</label>
                                    <input
                                        type="text"
                                        value={formData.unit_of_measure}
                                        onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                                        className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Reorder Level</label>
                                <input
                                    type="number"
                                    value={formData.reorder_level}
                                    onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Create Product
                            </button>
                        </form>
                    </div>
                )}

                {/* Products List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    SKU
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Unit Cost
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    UOM
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        No products yet. Add one to get started!
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id || product._local_id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{product.sku}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">₹{product.unit_cost.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{product.unit_of_measure}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product._synced ? (
                                                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    Synced
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => product.id && deleteProduct(product.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold mb-2">🚀 Offline-First Demo</h3>
                    <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                        <li>✅ Create products instantly (works offline)</li>
                        <li>✅ Changes saved to IndexedDB immediately</li>
                        <li>✅ Auto-syncs to server every 30 seconds when online</li>
                        <li>✅ Try going offline (disable network) and adding products!</li>
                        <li>✅ Re-enable network and watch them sync automatically</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
