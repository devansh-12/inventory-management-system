'use client';

import { Package, Truck, RefreshCw, FileText } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors">
          <Package className="w-6 h-6 text-green-600 mb-2" />
          <span className="text-sm font-medium text-green-700">Create Receipt</span>
        </button>
        <button className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
          <Truck className="w-6 h-6 text-blue-600 mb-2" />
          <span className="text-sm font-medium text-blue-700">Delivery Order</span>
        </button>
        <button className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors">
          <RefreshCw className="w-6 h-6 text-purple-600 mb-2" />
          <span className="text-sm font-medium text-purple-700">Internal Transfer</span>
        </button>
        <button className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors">
          <FileText className="w-6 h-6 text-orange-600 mb-2" />
          <span className="text-sm font-medium text-orange-700">Stock Adjustment</span>
        </button>
      </div>
    </div>
  );
}

