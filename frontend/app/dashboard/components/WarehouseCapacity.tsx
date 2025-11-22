'use client';

import type { WarehouseData } from '../types';

interface WarehouseCapacityProps {
  warehouses: WarehouseData[];
}

export default function WarehouseCapacity({ warehouses }: WarehouseCapacityProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Warehouse Capacity</h3>
      </div>
      <div className="space-y-4">
        {warehouses.map((warehouse, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{warehouse.name}</span>
              <span className="text-sm text-gray-600">{warehouse.stock} units</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  warehouse.status === 'high' ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.random() * 40 + 60}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">{warehouse.operations} operations</span>
              <span className="text-xs text-red-600">{warehouse.lowStock} low stock</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

