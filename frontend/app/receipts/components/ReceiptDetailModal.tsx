'use client';

import { X, Plus, CheckCircle, Printer } from 'lucide-react';
import type { Receipt, Product } from '../types';
import React from 'react';

interface ReceiptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt;
  onToDo: () => void;
  onValidate: () => void;
  onPrint: () => void;
  onAddProduct: (newProduct: { productCode: string; productName: string; quantity: number; }) => void;
  onReceiptFieldChange: (field: 'from' | 'to' | 'contact' | 'scheduleDate' | 'responsible', value: string | null) => void;
}

export default function ReceiptDetailModal({
  isOpen,
  onClose,
  receipt,
  onToDo,
  onValidate,
  onPrint,
  onAddProduct,
  onReceiptFieldChange,
}: ReceiptDetailModalProps) {
  const [newProduct, setNewProduct] = React.useState({ productCode: '', productName: '', quantity: 1 });

  if (!isOpen) return null;

  const handleAddProduct = () => {
    if (!newProduct.productCode || !newProduct.productName) {
      alert('Please fill in product code and name');
      return;
    }
    onAddProduct(newProduct);
    setNewProduct({ productCode: '', productName: '', quantity: 1 });
  };

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
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-50">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Receipt: {receipt.reference}</h2>
          <div className="flex items-center gap-3">
            {/* Status Workflow Indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className={receipt.status === 'Draft' ? 'font-semibold text-blue-600' : ''}>Draft</span>
              <span className="text-gray-400">›</span>
              <span className={receipt.status === 'Ready' ? 'font-semibold text-blue-600' : ''}>Ready</span>
              <span className="text-gray-400">›</span>
              <span className={receipt.status === 'Done' ? 'font-semibold text-blue-600' : ''}>Done</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
            {receipt.status === 'Draft' && (
              <button
                onClick={onToDo}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Set To Ready
              </button>
            )}
            {receipt.status === 'Ready' && (
              <button
                onClick={onValidate}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Validate
              </button>
            )}
            {receipt.status === 'Done' && (
              <button
                onClick={onPrint}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>

          {/* Receipt Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
              <div className="text-lg font-semibold text-gray-900">{receipt.reference}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receive From</label>
              <input
                type="text"
                value={receipt.from}
                onChange={(e) => onReceiptFieldChange('from', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To (Warehouse Location)</label>
              <input
                type="text"
                value={receipt.to}
                onChange={(e) => onReceiptFieldChange('to', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
              <input
                type="text"
                value={receipt.contact}
                onChange={(e) => onReceiptFieldChange('contact', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
              <input
                type="date"
                value={receipt.scheduleDate || ''}
                onChange={(e) => onReceiptFieldChange('scheduleDate', e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsible</label>
              <input
                type="text"
                value={receipt.responsible || 'Current User'}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-filled with current logged in user</p>
            </div>
          </div>

          {/* Products Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>

            {/* Products Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {receipt.products && receipt.products.length > 0 ? (
                    receipt.products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">[{product.productCode}]</span> {product.productName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{product.quantity}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-gray-500 text-sm">
                        No products added
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add New Product */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">New Product</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Product Code (e.g., DESK001)"
                  value={newProduct.productCode}
                  onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                />
                <input
                  type="text"
                  placeholder="Product Name (e.g., Desk)"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                  />
                  <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
