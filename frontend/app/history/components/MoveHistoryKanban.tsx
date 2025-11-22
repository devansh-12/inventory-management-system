'use client';

import type { MoveHistoryItem } from '../types';
import React from 'react';

interface MoveHistoryKanbanProps {
  items: MoveHistoryItem[];
}

export default function MoveHistoryKanban({ items }: MoveHistoryKanbanProps) {
  const typeOptions: MoveHistoryItem['type'][] = ['receipt', 'delivery', 'transfer', 'adjustment'];

  const groupedByType = typeOptions.reduce((acc, type) => {
    acc[type] = items.filter(item => item.type === type);
    return acc;
  }, {} as Record<MoveHistoryItem['type'], MoveHistoryItem[]>);

  const typeColors = {
    'receipt': 'bg-green-50 border-green-300',
    'delivery': 'bg-red-50 border-red-300',
    'transfer': 'bg-purple-50 border-purple-300',
    'adjustment': 'bg-orange-50 border-orange-300'
  };

  const typeIcons = {
    'receipt': '📥',
    'delivery': '📤',
    'transfer': '🔄',
    'adjustment': '📊'
  };

  const getItemColor = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      return 'bg-green-50 border-green-200 hover:border-green-400';
    } else if (direction === 'out') {
      return 'bg-red-50 border-red-200 hover:border-red-400';
    }
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {typeOptions.map((type) => (
        <div
          key={type}
          className={`rounded-xl shadow-lg border-2 transition-all ${typeColors[type]}`}
        >
          <div className="p-3 border-b-2 border-gray-200 bg-white/60 backdrop-blur-sm rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">{typeIcons[type]}</span>
                <h3 className="font-bold text-gray-800 text-sm capitalize">{type}</h3>
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-0.5 rounded-full shadow-sm">
                {groupedByType[type].length}
              </span>
            </div>
          </div>
          <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-250px)] overflow-y-auto">
            {groupedByType[type].map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg p-3 border-2 hover:shadow-xl transition-all duration-200 ${getItemColor(item.direction)}`}
              >
                <div className="font-bold text-gray-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <span className={`text-base ${item.direction === 'in' ? 'text-green-600' : item.direction === 'out' ? 'text-red-600' : ''}`}>
                    {item.direction === 'in' ? '↓' : item.direction === 'out' ? '↑' : '↔'}
                  </span>
                  {item.reference}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="font-medium text-gray-800">{item.product}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">From:</span> {item.from}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">To:</span> {item.to}
                  </div>
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-200">
                    <span className="text-gray-700">Qty: <strong className={item.direction === 'in' ? 'text-green-700' : item.direction === 'out' ? 'text-red-700' : ''}>{item.quantity}</strong></span>
                    <span className="text-gray-500 text-[10px]">{item.date.split(' ')[0]}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    by {item.user}
                  </div>
                </div>
              </div>
            ))}
            {groupedByType[type].length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-white/40 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-2xl mb-1">📭</div>
                <div className="text-xs font-medium">No {type} moves</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

