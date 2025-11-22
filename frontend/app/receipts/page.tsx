'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar';
import ReceiptsHeader from './components/ReceiptsHeader';
import ReceiptsTable from './components/ReceiptsTable';
import ReceiptsKanban from './components/ReceiptsKanban';
import AddReceiptModal from './components/AddReceiptModal';
import ReceiptDetailModal from './components/ReceiptDetailModal';

import type { Product, Receipt, Contact, Warehouse } from './types';
import { useEffect } from 'react';

export default function ReceiptsPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState<string>('receipts'); // Keep activeNav for Sidebar if it uses it
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedReceiptId, setDraggedReceiptId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof Receipt | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form state for new receipt
  const [newReceipt, setNewReceipt] = useState({
    from: '',
    to: '',
    contact: '',
    scheduleDate: '',
    status: 'Draft' as Receipt['status'],
  });

  // Data state
  const [receiptsData, setReceiptsData] = useState<Receipt[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [receiptsRes, contactsRes, warehousesRes] = await Promise.all([
          fetch('http://localhost:5000/api/receipts', { credentials: 'include' }),
          fetch('http://localhost:5000/api/contacts', { credentials: 'include' }),
          fetch('http://localhost:5000/api/warehouses', { credentials: 'include' })
        ]);

        if (receiptsRes.ok) {
          const data = await receiptsRes.json();
          // Map backend data to frontend model if needed
          const mappedReceipts = data.map((r: any) => ({
            id: r.id.toString(),
            reference: r.reference,
            from: r.contact_name || 'Unknown',
            to: r.warehouse_name || 'Unknown',
            contact: r.contact_name || 'Unknown', // Using contact name for contact field too for now
            scheduleDate: r.scheduled_date ? new Date(r.scheduled_date).toISOString().split('T')[0] : null,
            status: r.status,
            responsible: r.responsible_user_name,
            products: [] // Products are not returned in list view by default in this simple implementation, or we need to fetch them
          }));
          setReceiptsData(mappedReceipts);
        }

        if (contactsRes.ok) {
          setContacts(await contactsRes.json());
        }

        if (warehousesRes.ok) {
          setWarehouses(await warehousesRes.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Generate next reference number
  const generateNextReference = (): string => {
    const maxRef = receiptsData.reduce((max, receipt) => {
      const match = receipt.reference.match(/WH\/IN\/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextNum = (maxRef + 1).toString().padStart(4, '0');
    return `WH/IN/${nextNum}`;
  };

  // Get selected receipt
  const selectedReceipt = receiptsData.find(r => r.id === selectedReceiptId);

  // Handle adding new receipt
  const handleAddReceipt = async () => {
    if (!newReceipt.from || !newReceipt.to) {
      alert('Please select a contact and a warehouse');
      return;
    }

    try {
      const payload = {
        from_contact_id: parseInt(newReceipt.from),
        to_warehouse_id: parseInt(newReceipt.to),
        scheduled_date: newReceipt.scheduleDate || new Date().toISOString(),
        items: [] // Initial empty items
      };

      const res = await fetch('http://localhost:5000/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        // Refresh list
        window.location.reload(); // Simple reload for now, or re-fetch
        setIsModalOpen(false);
        setNewReceipt({
          from: '',
          to: '',
          contact: '',
          scheduleDate: '',
          status: 'Draft',
        });
      } else {
        const err = await res.json();
        alert(`Error creating receipt: ${err.error}`);
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      alert('Failed to create receipt');
    }
  };

  // Handle new receipt form changes
  const handleNewReceiptChange = (field: string, value: string | Receipt['status']) => {
    setNewReceipt(prev => ({ ...prev, [field as keyof typeof prev]: value }));
  };

  // Handle receipt detail changes
  const handleReceiptFieldChange = (field: 'from' | 'to' | 'contact' | 'scheduleDate' | 'responsible', value: string | null) => {
    if (selectedReceiptId) {
      setReceiptsData(prevReceipts =>
        prevReceipts.map(receipt =>
          receipt.id === selectedReceiptId
            ? { ...receipt, [field]: value }
            : receipt
        )
      );
    }
  };

  // Handle adding product to receipt
  const handleAddProductToReceipt = (newProduct: { productCode: string; productName: string; quantity: number; }) => {
    if (!selectedReceiptId) return;

    const product: Product = {
      id: Date.now().toString(),
      productCode: newProduct.productCode,
      productName: newProduct.productName,
      quantity: newProduct.quantity,
    };

    setReceiptsData(prevReceipts =>
      prevReceipts.map(receipt =>
        receipt.id === selectedReceiptId
          ? { ...receipt, products: [...(receipt.products || []), product] }
          : receipt
      )
    );
  };

  // Handle workflow actions
  const handleToDo = () => {
    if (selectedReceiptId && selectedReceipt?.status === 'Draft') {
      setReceiptsData(prevReceipts =>
        prevReceipts.map(receipt =>
          receipt.id === selectedReceiptId
            ? { ...receipt, status: 'Ready' }
            : receipt
        )
      );
    }
  };

  const handleValidate = () => {
    if (selectedReceiptId && selectedReceipt?.status === 'Ready') {
      setReceiptsData(prevReceipts =>
        prevReceipts.map(receipt =>
          receipt.id === selectedReceiptId
            ? { ...receipt, status: 'Done' }
            : receipt
        )
      );
    }
  };

  const handlePrint = () => {
    if (selectedReceipt) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const totalQuantity = selectedReceipt.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${selectedReceipt.reference}</title>
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
              .receipt-title {
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
              }
              .receipt-info {
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
              <div style="font-size: 12px; color: #666;">Warehouse Receipt Document</div>
            </div>

            <div class="receipt-title">RECEIPT</div>

            <div class="receipt-info">
              <div class="info-section">
                <div class="info-label">Receipt Reference</div>
                <div class="info-value" style="font-size: 18px; font-weight: bold;">${selectedReceipt.reference}</div>
                
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge">${selectedReceipt.status}</span>
                </div>
                
                <div class="info-label">Date</div>
                <div class="info-value">${currentDate}</div>
              </div>
              
              <div class="info-section">
                <div class="info-label">Receive From</div>
                <div class="info-value">${selectedReceipt.from}</div>
                
                <div class="info-label">Warehouse Location</div>
                <div class="info-value">${selectedReceipt.to}</div>
                
                <div class="info-label">Contact</div>
                <div class="info-value">${selectedReceipt.contact}</div>
                
                ${selectedReceipt.scheduleDate ? `
                <div class="info-label">Schedule Date</div>
                <div class="info-value">${new Date(selectedReceipt.scheduleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                ` : ''}
                
                <div class="info-label">Responsible</div>
                <div class="info-value">${selectedReceipt.responsible || 'Current User'}</div>
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
                ${selectedReceipt.products && selectedReceipt.products.length > 0 ?
          selectedReceipt.products.map(product => `
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
                <span><strong>${selectedReceipt.products?.length || 0}</strong></span>
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
                <div class="signature-line">Received By</div>
              </div>
            </div>

            <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #999;">
              This is a computer-generated receipt. No signature required.
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Close window after printing (optional)
        // printWindow.close();
      }, 250);
    }
  };

  // Filter and sort receipts
  let filteredReceipts = receiptsData.filter(receipt => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        receipt.reference.toLowerCase().includes(query) ||
        receipt.contact.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Apply sorting
  if (sortColumn) {
    filteredReceipts = [...filteredReceipts].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle null values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Convert to string for comparison
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
  const handleDragStart = (e: React.DragEvent, receiptId: string) => {
    setDraggedReceiptId(receiptId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Receipt['status']) => {
    e.preventDefault();
    if (draggedReceiptId) {
      setReceiptsData(prevReceipts =>
        prevReceipts.map(receipt =>
          receipt.id === draggedReceiptId
            ? { ...receipt, status: newStatus }
            : receipt
        )
      );
      setDraggedReceiptId(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar active={activeNav} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation remains in page for now, as it's a general layout item */}
        {/* The previous header content for Bell, HelpCircle, Settings, User is now global in layout.tsx or similar file. This page only needs its local header content. */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 relative z-10">
          {/* Assuming a global header or empty for now, based on your previous dashboard changes */}
          <div className="flex items-center justify-end">
            {/* Placeholder for any page-specific header elements if needed */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <ReceiptsHeader
            onNewReceiptClick={() => setIsModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {viewMode === 'list' && (
            <ReceiptsTable
              receipts={filteredReceipts}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={setSortColumn}
              selectedReceiptId={selectedReceiptId}
              onSelectReceipt={setSelectedReceiptId}
              onDoubleClickReceipt={(id) => {
                setSelectedReceiptId(id);
                setIsDetailModalOpen(true);
              }}
            />
          )}

          {viewMode === 'kanban' && (
            <ReceiptsKanban
              receipts={filteredReceipts}
              draggedReceiptId={draggedReceiptId}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          )}

          <AddReceiptModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            newReceipt={newReceipt}
            onNewReceiptChange={handleNewReceiptChange}
            onAddReceipt={handleAddReceipt}
            contacts={contacts}
            warehouses={warehouses}
          />

          {isDetailModalOpen && selectedReceipt && (
            <ReceiptDetailModal
              isOpen={isDetailModalOpen}
              onClose={() => setIsDetailModalOpen(false)}
              receipt={selectedReceipt}
              onToDo={handleToDo}
              onValidate={handleValidate}
              onPrint={handlePrint}
              onAddProduct={handleAddProductToReceipt}
              onReceiptFieldChange={handleReceiptFieldChange}
            />
          )}
        </main>
      </div>
    </div>
  );
}

