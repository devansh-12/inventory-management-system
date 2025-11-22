'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import type { KPIData } from '../types';

interface KPICardProps {
  kpi: KPIData;
}

export default function KPICard({ kpi }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-sm text-gray-600 mb-2">{kpi.label}</div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {kpi.trend === 'up' && <ArrowUp className="w-4 h-4" />}
          {kpi.trend === 'down' && <ArrowDown className="w-4 h-4" />}
          {kpi.change}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">{kpi.period}</div>
    </div>
  );
}

