'use client';

import type { Alert } from '../types';

interface AlertsListProps {
  alerts: Alert[];
}

export default function AlertsList({ alerts }: AlertsListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Alerts & Exceptions</h3>
        <span className="text-sm text-gray-600">{alerts.length} items need attention</span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${
                alert.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
              }`}></div>
              <div>
                <div className="font-medium text-gray-900">{alert.product}</div>
                <div className="text-sm text-gray-600">{alert.sku} • {alert.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${
                alert.priority === 'high' ? 'text-red-600' : 'text-orange-600'
              }`}>{alert.issue}</span>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

