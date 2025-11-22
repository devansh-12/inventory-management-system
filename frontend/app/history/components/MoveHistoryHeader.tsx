'use client';

import { Search, List, LayoutGrid } from 'lucide-react';
import React from 'react';

interface MoveHistoryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'list' | 'kanban';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
}

export default function MoveHistoryHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: MoveHistoryHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Move History</h1>
        <p className="text-sm text-gray-600 mt-1">
          Complete history of all inventory movements between locations
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, product, SKU..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full min-w-[250px] text-gray-900"
          />
        </div>

        {/* View Toggle Icons */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded transition-colors ${viewMode === 'list'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange('kanban')}
            className={`p-2 rounded transition-colors ${viewMode === 'kanban'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
            title="Kanban View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

