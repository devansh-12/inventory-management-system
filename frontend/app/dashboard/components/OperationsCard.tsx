'use client';

import { Package, Truck } from 'lucide-react';

interface OperationsCardProps {
  type: 'receipt' | 'delivery';
  title: string;
  count: number;
  late: number;
  pending: number;
  waiting?: number;
  total: number;
}

export default function OperationsCard({ 
  type, 
  title, 
  count, 
  late, 
  pending, 
  waiting, 
  total 
}: OperationsCardProps) {
  const Icon = type === 'receipt' ? Package : Truck;
  const colorClass = type === 'receipt' 
    ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
    : 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800';
  const iconColor = type === 'receipt' ? 'text-blue-600' : 'text-green-600';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      
      <div className="mb-6">
        <button className={`w-full bg-gradient-to-r ${colorClass} text-white rounded-lg py-4 px-6 font-semibold text-lg transition-all shadow-md hover:shadow-lg`}>
          {count} to {type === 'receipt' ? 'Receive' : 'Deliver'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-2xl font-bold text-red-600">{late}</div>
          <div className="text-sm text-gray-600">{type === 'receipt' ? 'Late Receipts' : 'Late'}</div>
        </div>
        {waiting !== undefined ? (
          <>
            <div>
              <div className="text-2xl font-bold text-orange-600">{waiting}</div>
              <div className="text-sm text-gray-600">Waiting</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="text-2xl font-bold text-gray-900">{pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-600">Total Operations</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

