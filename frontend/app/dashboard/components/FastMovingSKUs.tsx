'use client';

import { TrendingUp } from 'lucide-react';
import type { FastMovingItem } from '../types';

interface FastMovingSKUsProps {
  items: FastMovingItem[];
}

export default function FastMovingSKUs({ items }: FastMovingSKUsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Fast-Moving SKUs</h3>
        <TrendingUp className="w-5 h-5 text-green-600" />
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <div className="text-sm font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">{item.sku}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{item.moved}</div>
              <div className="text-xs text-green-600">{item.trend}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

