'use client';

import type { RecentActivity as RecentActivityType } from '../types';

interface RecentActivityProps {
  activities: RecentActivityType[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Alerts and Activity</h3>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg ${activity.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                <div className="text-xs text-gray-500 mt-1">by {activity.user} • {activity.time}</div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

