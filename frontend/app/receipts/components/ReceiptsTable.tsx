'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import type { Receipt } from '../types';
import React from 'react';

interface ReceiptsTableProps {
  receipts: Receipt[];
  sortColumn: keyof Receipt | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof Receipt) => void;
  selectedReceiptId: string | null;
  onSelectReceipt: (id: string) => void;
  onDoubleClickReceipt: (id: string) => void;
}

export default function ReceiptsTable({
  receipts,
  sortColumn,
  sortDirection,
  onSort,
  selectedReceiptId,
  onSelectReceipt,
  onDoubleClickReceipt,
}: ReceiptsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Done':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {(['reference', 'from', 'to', 'contact', 'scheduleDate', 'status'] as (keyof Receipt)[])
                .map((column) => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => onSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      {column.charAt(0).toUpperCase() + column.slice(1) === 'Scheduledate' ? 'Schedule Date' : column.charAt(0).toUpperCase() + column.slice(1)}
                      {sortColumn === column ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-blue-600" />
                        )
                      ) : (
                        <ArrowDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No receipts found
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  onClick={() => onSelectReceipt(receipt.id)}
                  onDoubleClick={() => onDoubleClickReceipt(receipt.id)}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedReceiptId === receipt.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{receipt.reference}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{receipt.from}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{receipt.to}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{receipt.contact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{receipt.scheduleDate || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(receipt.status)}`}>
                      {receipt.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
