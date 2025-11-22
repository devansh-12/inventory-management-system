'use client';

import { X } from 'lucide-react';
import type { Receipt, Contact, Warehouse } from '../types';
import React from 'react';

interface AddReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  newReceipt: { from: string; to: string; contact: string; scheduleDate: string; status: Receipt['status']; };
  onNewReceiptChange: (field: string, value: string | Receipt['status']) => void;
  onAddReceipt: () => void;
  contacts: Contact[];
  warehouses: Warehouse[];
}

const statusOptions: Receipt['status'][] = ['Draft', 'Ready', 'In Progress', 'Done', 'Cancelled'];

export default function AddReceiptModal({
  isOpen,
  onClose,
  newReceipt,
  onNewReceiptChange,
  onAddReceipt,
  contacts,
  warehouses,
}: AddReceiptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Receipt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From (Contact) <span className="text-red-500">*</span>
            </label>
            <select
              value={newReceipt.from}
              onChange={(e) => onNewReceiptChange('from', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            >
              <option value="">Select Contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To (Warehouse Location) <span className="text-red-500">*</span>
            </label>
            <select
              value={newReceipt.to}
              onChange={(e) => onNewReceiptChange('to', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.short_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newReceipt.contact}
              onChange={(e) => onNewReceiptChange('contact', e.target.value as string)}
              placeholder="Enter contact name (optional override)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Date
            </label>
            <input
              type="date"
              value={newReceipt.scheduleDate}
              onChange={(e) => onNewReceiptChange('scheduleDate', e.target.value as string)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={newReceipt.status}
              onChange={(e) => onNewReceiptChange('status', e.target.value as Receipt['status'])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={onAddReceipt}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
