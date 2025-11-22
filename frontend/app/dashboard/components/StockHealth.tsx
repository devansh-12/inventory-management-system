'use client';

export default function StockHealth() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Stock Health</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-900">Healthy Stock</div>
            <div className="text-xs text-gray-500">Above reorder level</div>
          </div>
          <div className="text-2xl font-bold text-green-600">892</div>
        </div>
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-900">Reorder Soon</div>
            <div className="text-xs text-gray-500">Near reorder point</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">45</div>
        </div>
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-900">Critical Level</div>
            <div className="text-xs text-gray-500">Immediate action needed</div>
          </div>
          <div className="text-2xl font-bold text-red-600">23</div>
        </div>
      </div>
    </div>
  );
}

