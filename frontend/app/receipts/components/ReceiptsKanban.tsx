'use client';

import type { Receipt } from '../types';
import React from 'react';

interface ReceiptsKanbanProps {
  receipts: Receipt[];
  draggedReceiptId: string | null;
  onDragStart: (e: React.DragEvent, receiptId: string) => void;
  onDrop: (e: React.DragEvent, newStatus: Receipt['status']) => void;
}

export default function ReceiptsKanban({
  receipts,
  draggedReceiptId,
  onDragStart,
  onDrop,
}: ReceiptsKanbanProps) {
  const statusOptions: Receipt['status'][] = ['Draft', 'Ready', 'In Progress', 'Done', 'Cancelled'];

  const groupedByStatus = statusOptions.reduce((acc, status) => {
    acc[status] = receipts.filter(r => r.status === status);
    return acc;
  }, {} as Record<Receipt['status'], Receipt[]>);

  const statusColors = {
    'Draft': 'bg-gray-100 border-gray-300',
    'Ready': 'bg-blue-50 border-blue-300',
    'In Progress': 'bg-amber-50 border-amber-300',
    'Done': 'bg-emerald-50 border-emerald-300',
    'Cancelled': 'bg-red-50 border-red-300'
  };

  const statusIcons = {
    'Draft': '📝',
    'Ready': '🎯',
    'In Progress': '⚡',
    'Done': '✅',
    'Cancelled': '❌'
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="grid grid-cols-5 gap-4 px-4">
      {statusOptions.map((status) => (
        <div
          key={status}
          className={`rounded-xl shadow-lg border-2 transition-all ${statusColors[status]}`}
          onDragOver={handleDragOver}
          onDrop={(e) => onDrop(e, status)}
        >
          <div className="p-3 border-b-2 border-gray-200 bg-white/60 backdrop-blur-sm rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">{statusIcons[status]}</span>
                <h3 className="font-bold text-gray-800 text-sm">{status}</h3>
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-0.5 rounded-full shadow-sm">
                {groupedByStatus[status].length}
              </span>
            </div>
          </div>
          <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-250px)] overflow-y-auto">
            {groupedByStatus[status].map((receipt) => (
              <div
                key={receipt.id}
                draggable
                onDragStart={(e) => onDragStart(e, receipt.id)}
                className={`bg-white rounded-lg p-3 border-2 border-gray-200 hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                  draggedReceiptId === receipt.id ? 'opacity-50 scale-95 rotate-2' : ''
                }`}
              >
                <div className="font-bold text-gray-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="text-blue-600 text-base">📄</span>
                  {receipt.reference}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="font-medium text-gray-800">{receipt.contact}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">↗</span> {receipt.from}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">↘</span> {receipt.to}
                  </div>
                  {receipt.scheduleDate && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-200 flex items-center gap-1 text-gray-700">
                      <span>🗓️</span> {receipt.scheduleDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {groupedByStatus[status].length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-white/40 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-2xl mb-1">↓</div>
                <div className="text-xs font-medium">Drop items here</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}