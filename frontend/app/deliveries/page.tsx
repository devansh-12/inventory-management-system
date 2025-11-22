'use client';

import { useState } from 'react';
import { Search, Bell, HelpCircle, Settings, User, Package, Warehouse, FileText, Activity, BarChart3, Box, Clock, List, LayoutGrid, Plus, X, ArrowDown, ArrowUp, CheckCircle, Printer, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Type Definitions
interface Product {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
  inStock?: boolean; // For stock alerts
}

interface Delivery {
  id: string;
  reference: string;
  from: string;
  to: string;
  contact: string;
  scheduleDate: string | null;
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done';
  responsible?: string;
  deliveryAddress?: string;
  operationType?: string;
  products?: Product[];
}

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

export default function DeliveriesPage() {
  const [activeNav, setActiveNav] = useState<string>('delivery');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedDeliveryId, setDraggedDeliveryId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof Delivery | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [newProduct, setNewProduct] = useState({ productCode: '', productName: '', quantity: 1 });

  // Form state for new delivery
  const [newDelivery, setNewDelivery] = useState({
    from: '',
    to: '',
    contact: '',
    scheduleDate: '',
    status: 'Draft' as Delivery['status'],
    deliveryAddress: '',
    operationType: '',
  });

  // Dummy data for deliveries
  const [deliveriesData, setDeliveriesData] = useState<Delivery[]>([
    { 
      id: '1', 
      reference: 'WH/OUT/0001', 
      from: 'WH/Stock1', 
      to: 'vendor', 
      contact: 'Azure Interior', 
      scheduleDate: null, 
      status: 'Ready', 
      responsible: 'John Doe',
      deliveryAddress: '123 Main St, City, State',
      operationType: 'Outbound',
      products: [{ id: '1', productCode: 'DESK001', productName: 'Desk', quantity: 6, inStock: true }] 
    },
    { 
      id: '2', 
      reference: 'WH/OUT/0002', 
      from: 'WH/Stock1', 
      to: 'vendor', 
      contact: 'Azure Interior', 
      scheduleDate: null, 
      status: 'Ready', 
      responsible: 'Jane Smith',
      deliveryAddress: '456 Oak Ave, City, State',
      operationType: 'Outbound',
      products: [] 
    },
    { 
      id: '3', 
      reference: 'WH/OUT/0003', 
      from: 'WH/Stock2', 
      to: 'customer', 
      contact: 'Tech Solutions', 
      scheduleDate: '2024-01-15', 
      status: 'Waiting', 
      responsible: 'Mike Johnson',
      deliveryAddress: '789 Pine Rd, City, State',
      operationType: 'Outbound',
      products: [{ id: '2', productCode: 'CHAIR001', productName: 'Chair', quantity: 4, inStock: false }] 
    },
    { 
      id: '4', 
      reference: 'WH/OUT/0004', 
      from: 'WH/Stock1', 
      to: 'vendor', 
      contact: 'Global Supplies', 
      scheduleDate: '2024-01-16', 
      status: 'Draft', 
      responsible: 'Sarah Lee',
      deliveryAddress: '321 Elm St, City, State',
      operationType: 'Outbound',
      products: [] 
    },
    { 
      id: '5', 
      reference: 'WH/OUT/0005', 
      from: 'WH/Stock3', 
      to: 'customer', 
      contact: 'Azure Interior', 
      scheduleDate: '2024-01-17', 
      status: 'Ready', 
      responsible: 'Tom Wilson',
      deliveryAddress: '654 Maple Dr, City, State',
      operationType: 'Outbound',
      products: [] 
    },
    { 
      id: '6', 
      reference: 'WH/OUT/0006', 
      from: 'WH/Stock2', 
      to: 'vendor', 
      contact: 'Tech Solutions', 
      scheduleDate: null, 
      status: 'Done', 
      responsible: 'Emily Brown',
      deliveryAddress: '987 Cedar Ln, City, State',
      operationType: 'Outbound',
      products: [] 
    },
  ]);

  const navItems: NavItem[] = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'receipt', icon: Package, label: 'Receipt Operations' },
    { id: 'delivery', icon: Package, label: 'Delivery Operations' },
    { id: 'stock', icon: Box, label: 'Stock' },
    { id: 'warehouse', icon: Warehouse, label: 'Warehouse' },
    { id: 'operations', icon: Activity, label: 'Dashboard Operations' },
    { id: 'history', icon: Clock, label: 'Move History' },
    { id: 'support', icon: HelpCircle, label: 'Support' },
  ];

  const statusOptions: Delivery['status'][] = ['Draft', 'Waiting', 'Ready', 'Done'];
  const operationTypes = ['Outbound', 'Transfer', 'Return'];

  // Generate next reference number
  const generateNextReference = (): string => {
    const maxRef = deliveriesData.reduce((max, delivery) => {
      const match = delivery.reference.match(/WH\/OUT\/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextNum = (maxRef + 1).toString().padStart(4, '0');
    return `WH/OUT/${nextNum}`;
  };

  // Get selected delivery
  const selectedDelivery = deliveriesData.find(d => d.id === selectedDeliveryId);

  // Handle adding new delivery
  const handleAddDelivery = () => {
    if (!newDelivery.from || !newDelivery.to || !newDelivery.contact) {
      alert('Please fill in all required fields');
      return;
    }

    const newDeliveryData: Delivery = {
      id: (deliveriesData.length + 1).toString(),
      reference: generateNextReference(),
      from: newDelivery.from,
      to: newDelivery.to,
      contact: newDelivery.contact,
      scheduleDate: newDelivery.scheduleDate || null,
      status: newDelivery.status,
      responsible: 'Current User',
      deliveryAddress: newDelivery.deliveryAddress || '',
      operationType: newDelivery.operationType || 'Outbound',
      products: [],
    };

    setDeliveriesData([...deliveriesData, newDeliveryData]);
    setIsModalOpen(false);
    setNewDelivery({
      from: '',
      to: '',
      contact: '',
      scheduleDate: '',
      status: 'Draft',
      deliveryAddress: '',
      operationType: '',
    });
  };

  // Handle workflow actions
  const handleValidate = () => {
    if (selectedDeliveryId && selectedDelivery?.status === 'Ready') {
      setDeliveriesData(prevDeliveries =>
        prevDeliveries.map(delivery =>
          delivery.id === selectedDeliveryId
            ? { ...delivery, status: 'Done' }
            : delivery
        )
      );
    }
  };

  const handlePrint = () => {
    if (selectedDelivery) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const totalQuantity = selectedDelivery.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Delivery - ${selectedDelivery.reference}</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 20mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  color: #000;
                }
              }
              body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                color: #000;
                background: #fff;
              }
              .header {
                border-bottom: 3px solid #000;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .company-name {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .delivery-title {
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
              }
              .delivery-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                padding: 20px;
                background: #f9f9f9;
                border: 1px solid #ddd;
              }
              .info-section {
                flex: 1;
              }
              .info-label {
                font-weight: bold;
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
                text-transform: uppercase;
              }
              .info-value {
                font-size: 14px;
                margin-bottom: 15px;
              }
              .products-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
              }
              .products-table th {
                background: #000;
                color: #fff;
                padding: 12px;
                text-align: left;
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
              }
              .products-table td {
                padding: 12px;
                border-bottom: 1px solid #ddd;
                font-size: 14px;
              }
              .products-table tr:last-child td {
                border-bottom: 2px solid #000;
              }
              .total-section {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #000;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                font-size: 16px;
              }
              .total-row.total {
                font-weight: bold;
                font-size: 18px;
                border-top: 1px solid #ddd;
                padding-top: 15px;
                margin-top: 10px;
              }
              .footer {
                margin-top: 50px;
                padding-top: 30px;
                border-top: 1px solid #ddd;
                display: flex;
                justify-content: space-between;
              }
              .signature {
                width: 200px;
                text-align: center;
              }
              .signature-line {
                border-top: 1px solid #000;
                margin-top: 60px;
                padding-top: 5px;
                font-size: 12px;
              }
              .status-badge {
                display: inline-block;
                padding: 5px 15px;
                background: #000;
                color: #fff;
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">Inventory Management System</div>
              <div style="font-size: 12px; color: #666;">Warehouse Delivery Document</div>
            </div>

            <div class="delivery-title">DELIVERY</div>

            <div class="delivery-info">
              <div class="info-section">
                <div class="info-label">Delivery Reference</div>
                <div class="info-value" style="font-size: 18px; font-weight: bold;">${selectedDelivery.reference}</div>
                
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge">${selectedDelivery.status}</span>
                </div>
                
                <div class="info-label">Date</div>
                <div class="info-value">${currentDate}</div>
              </div>
              
              <div class="info-section">
                <div class="info-label">Deliver From</div>
                <div class="info-value">${selectedDelivery.from}</div>
                
                <div class="info-label">Deliver To</div>
                <div class="info-value">${selectedDelivery.to}</div>
                
                <div class="info-label">Contact</div>
                <div class="info-value">${selectedDelivery.contact}</div>
                
                ${selectedDelivery.deliveryAddress ? `
                <div class="info-label">Delivery Address</div>
                <div class="info-value">${selectedDelivery.deliveryAddress}</div>
                ` : ''}
                
                ${selectedDelivery.scheduleDate ? `
                <div class="info-label">Schedule Date</div>
                <div class="info-value">${new Date(selectedDelivery.scheduleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                ` : ''}
                
                <div class="info-label">Responsible</div>
                <div class="info-value">${selectedDelivery.responsible || 'Current User'}</div>
              </div>
            </div>

            <table class="products-table">
              <thead>
                <tr>
                  <th style="width: 60%;">Product</th>
                  <th style="width: 20%;">Code</th>
                  <th style="width: 20%; text-align: right;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${selectedDelivery.products && selectedDelivery.products.length > 0 ? 
                  selectedDelivery.products.map(product => `
                    <tr>
                      <td>${product.productName}</td>
                      <td>${product.productCode}</td>
                      <td style="text-align: right;">${product.quantity}</td>
                    </tr>
                  `).join('') : 
                  '<tr><td colspan="3" style="text-align: center; padding: 30px; color: #999;">No products listed</td></tr>'
                }
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-row">
                <span>Total Items:</span>
                <span><strong>${selectedDelivery.products?.length || 0}</strong></span>
              </div>
              <div class="total-row">
                <span>Total Quantity:</span>
                <span><strong>${totalQuantity}</strong></span>
              </div>
            </div>

            <div class="footer">
              <div class="signature">
                <div class="signature-line">Prepared By</div>
              </div>
              <div class="signature">
                <div class="signature-line">Delivered By</div>
              </div>
            </div>

            <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #999;">
              This is a computer-generated delivery document. No signature required.
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    }
  };

  // Handle adding product to delivery
  const handleAddProduct = () => {
    if (!selectedDeliveryId || !newProduct.productCode || !newProduct.productName) {
      alert('Please fill in product code and name');
      return;
    }

    // Check stock (mock check - in real app, this would check actual stock)
    const inStock = Math.random() > 0.3; // 70% chance of being in stock

    const product: Product = {
      id: Date.now().toString(),
      productCode: newProduct.productCode,
      productName: newProduct.productName,
      quantity: newProduct.quantity,
      inStock: inStock,
    };

    setDeliveriesData(prevDeliveries =>
      prevDeliveries.map(delivery =>
        delivery.id === selectedDeliveryId
          ? { ...delivery, products: [...(delivery.products || []), product] }
          : delivery
      )
    );

    setNewProduct({ productCode: '', productName: '', quantity: 1 });
  };

  // Handle column sorting
  const handleSort = (column: keyof Delivery) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort deliveries
  let filteredDeliveries = deliveriesData.filter(delivery => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        delivery.reference.toLowerCase().includes(query) ||
        delivery.contact.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Apply sorting
  if (sortColumn) {
    filteredDeliveries = [...filteredDeliveries].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
      } else {
        return aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
      }
    });
  }

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, deliveryId: string) => {
    setDraggedDeliveryId(deliveryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Delivery['status']) => {
    e.preventDefault();
    if (draggedDeliveryId) {
      setDeliveriesData(prevDeliveries =>
        prevDeliveries.map(delivery =>
          delivery.id === draggedDeliveryId
            ? { ...delivery, status: newStatus }
            : delivery
        )
      );
      setDraggedDeliveryId(null);
    }
  };

  // Group deliveries by status for Kanban view
  const groupedByStatus = {
    'Draft': filteredDeliveries.filter(d => d.status === 'Draft'),
    'Waiting': filteredDeliveries.filter(d => d.status === 'Waiting'),
    'Ready': filteredDeliveries.filter(d => d.status === 'Ready'),
    'Done': filteredDeliveries.filter(d => d.status === 'Done'),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Done':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">InventoryMS</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeNav === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 relative z-50">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Deliveries Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Deliveries Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                NEW
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Delivery</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search Icon */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reference or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-100 text-gray-900"
                />
              </div>
              
              {/* View Toggle Icons */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'kanban'
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

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('reference')}
                      >
                        <div className="flex items-center gap-2">
                          Reference
                          {sortColumn === 'reference' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-blue-600" />
                            )
                          ) : (
                            <ArrowDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('from')}
                      >
                        <div className="flex items-center gap-2">
                          From
                          {sortColumn === 'from' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-blue-600" />
                            )
                          ) : (
                            <ArrowDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('to')}
                      >
                        <div className="flex items-center gap-2">
                          To
                          {sortColumn === 'to' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-blue-600" />
                            )
                          ) : (
                            <ArrowDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('contact')}
                      >
                        <div className="flex items-center gap-2">
                          Contact
                          {sortColumn === 'contact' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-blue-600" />
                            )
                          ) : (
                            <ArrowDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('scheduleDate')}
                      >
                        <div className="flex items-center gap-2">
                          Schedule date
                          {sortColumn === 'scheduleDate' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-blue-600" />
                            )
                          ) : (
                            <ArrowDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {sortColumn === 'status' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-blue-600" />
                            )
                          ) : (
                            <ArrowDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDeliveries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No deliveries found
                        </td>
                      </tr>
                    ) : (
                      filteredDeliveries.map((delivery) => (
                        <tr 
                          key={delivery.id} 
                          onClick={() => setSelectedDeliveryId(delivery.id)}
                          onDoubleClick={() => {
                            setSelectedDeliveryId(delivery.id);
                            setIsDetailModalOpen(true);
                          }}
                          className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                            selectedDeliveryId === delivery.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{delivery.reference}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{delivery.from}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{delivery.to}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{delivery.contact}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{delivery.scheduleDate || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                              {delivery.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Kanban View */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(groupedByStatus).map(([status, deliveries]) => (
                <div
                  key={status}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status as Delivery['status'])}
                >
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">{status}</h3>
                    <span className="text-xs text-gray-500">{deliveries.length} items</span>
                  </div>
                  <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {deliveries.map((delivery) => (
                      <div
                        key={delivery.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, delivery.id)}
                        className={`bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-move ${
                          draggedDeliveryId === delivery.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-900 mb-1">{delivery.reference}</div>
                        <div className="text-xs text-gray-600 mb-2">{delivery.contact}</div>
                        <div className="text-xs text-gray-500">
                          <div>From: {delivery.from}</div>
                          <div>To: {delivery.to}</div>
                          {delivery.scheduleDate && (
                            <div className="mt-1">Date: {delivery.scheduleDate}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {deliveries.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg p-4">
                        Drop here
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Delivery Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto z-50">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Delivery</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From (Warehouse) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newDelivery.from}
                      onChange={(e) => setNewDelivery({ ...newDelivery, from: e.target.value })}
                      placeholder="Enter source warehouse (e.g., WH/Stock1)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newDelivery.to}
                      onChange={(e) => setNewDelivery({ ...newDelivery, to: e.target.value })}
                      placeholder="Enter destination (e.g., vendor, customer)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newDelivery.contact}
                      onChange={(e) => setNewDelivery({ ...newDelivery, contact: e.target.value })}
                      placeholder="Enter contact name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      value={newDelivery.deliveryAddress}
                      onChange={(e) => setNewDelivery({ ...newDelivery, deliveryAddress: e.target.value })}
                      placeholder="Enter delivery address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Date
                    </label>
                    <input
                      type="date"
                      value={newDelivery.scheduleDate}
                      onChange={(e) => setNewDelivery({ ...newDelivery, scheduleDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operation Type
                    </label>
                    <select
                      value={newDelivery.operationType}
                      onChange={(e) => setNewDelivery({ ...newDelivery, operationType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select operation type</option>
                      {operationTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newDelivery.status}
                      onChange={(e) => setNewDelivery({ ...newDelivery, status: e.target.value as Delivery['status'] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleAddDelivery}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Delivery
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Detail Modal */}
          {isDetailModalOpen && selectedDelivery && (
            <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto z-50">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Delivery</h2>
                  <div className="flex items-center gap-3">
                    {/* Status Workflow Indicator */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className={selectedDelivery.status === 'Draft' ? 'font-semibold text-blue-600' : ''}>Draft</span>
                      <span className="text-gray-400">›</span>
                      <span className={selectedDelivery.status === 'Waiting' ? 'font-semibold text-blue-600' : ''}>Waiting</span>
                      <span className="text-gray-400">›</span>
                      <span className={selectedDelivery.status === 'Ready' ? 'font-semibold text-blue-600' : ''}>Ready</span>
                      <span className="text-gray-400">›</span>
                      <span className={selectedDelivery.status === 'Done' ? 'font-semibold text-blue-600' : ''}>Done</span>
                    </div>
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New
                    </button>
                    {selectedDelivery.status === 'Ready' && (
                      <button
                        onClick={handleValidate}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Validate
                      </button>
                    )}
                    {selectedDelivery.status === 'Done' && (
                      <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                    )}
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Delivery Information */}
                  <div>
                    <div className="text-lg font-semibold text-gray-900 mb-4">{selectedDelivery.reference}</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                        <input
                          type="text"
                          value={selectedDelivery.deliveryAddress || ''}
                          onChange={(e) => {
                            setDeliveriesData(prevDeliveries =>
                              prevDeliveries.map(delivery =>
                                delivery.id === selectedDeliveryId
                                  ? { ...delivery, deliveryAddress: e.target.value }
                                  : delivery
                              )
                            );
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Responsible</label>
                        <input
                          type="text"
                          value={selectedDelivery.responsible || 'Current User'}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-filled with current logged in user</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
                        <input
                          type="date"
                          value={selectedDelivery.scheduleDate || ''}
                          onChange={(e) => {
                            setDeliveriesData(prevDeliveries =>
                              prevDeliveries.map(delivery =>
                                delivery.id === selectedDeliveryId
                                  ? { ...delivery, scheduleDate: e.target.value || null }
                                  : delivery
                              )
                            );
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Operation type</label>
                        <div className="relative">
                          <select
                            value={selectedDelivery.operationType || ''}
                            onChange={(e) => {
                              setDeliveriesData(prevDeliveries =>
                                prevDeliveries.map(delivery =>
                                  delivery.id === selectedDeliveryId
                                    ? { ...delivery, operationType: e.target.value }
                                    : delivery
                                )
                              );
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 appearance-none pr-8"
                          >
                            <option value="">Select operation type</option>
                            {operationTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ArrowDown className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
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
                          {selectedDelivery.products && selectedDelivery.products.length > 0 ? (
                            selectedDelivery.products.map((product) => (
                              <tr 
                                key={product.id}
                                className={product.inStock === false ? 'bg-red-50 border-l-4 border-red-500' : ''}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm text-gray-900">
                                      <span className="font-medium">[{product.productCode}]</span> {product.productName}
                                    </div>
                                    {product.inStock === false && (
                                      <AlertCircle className="w-4 h-4 text-red-500" title="Product not in stock" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className={`text-sm ${product.inStock === false ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                                    {product.quantity}
                                  </div>
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
                      <p className="text-xs text-gray-500 mt-2">
                        Note: Products not in stock will be marked in red with an alert icon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

