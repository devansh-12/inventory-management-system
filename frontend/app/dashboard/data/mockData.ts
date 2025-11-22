import { Package, Truck, RefreshCw, FileText, AlertTriangle, BarChart3, Box, Warehouse, Activity, Clock, HelpCircle } from 'lucide-react';
import type { KPIData, RecentActivity, Alert, WarehouseData, FastMovingItem, WarehouseLocation } from '../types';

export const mockKPIData: KPIData[] = [
  { label: 'Total Stock Count', value: '45,892', change: '+12%', trend: 'up', period: 'vs last month' },
  { label: 'Low Stock Items', value: '23', change: '-5%', trend: 'down', period: 'vs last week' },
  { label: 'Pending Receipts', value: '18', change: '+3', trend: 'up', period: 'Today' },
  { label: 'Pending Deliveries', value: '34', change: '+8', trend: 'up', period: 'Today' },
  { label: 'Internal Transfers', value: '12', change: '0', trend: 'neutral', period: 'In Progress' },
  { label: 'Adjustments Pending', value: '7', change: '-2', trend: 'down', period: 'Awaiting Approval' },
];

export const mockRecentActivity: RecentActivity[] = [
  { type: 'receipt', action: 'Receipt #R-2845 validated', user: 'John Smith', time: '2 min ago', icon: Package, color: 'bg-green-100 text-green-600' },
  { type: 'delivery', action: 'Delivery #D-1923 completed', user: 'Sarah Lee', time: '8 min ago', icon: Truck, color: 'bg-blue-100 text-blue-600' },
  { type: 'transfer', action: 'Transfer #T-5612 scheduled', user: 'Mike Johnson', time: '15 min ago', icon: RefreshCw, color: 'bg-purple-100 text-purple-600' },
  { type: 'adjustment', action: 'Stock adjustment performed', user: 'Admin', time: '23 min ago', icon: FileText, color: 'bg-orange-100 text-orange-600' },
  { type: 'alert', action: 'Low stock alert triggered', user: 'System', time: '35 min ago', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
];

export const mockAlerts: Alert[] = [
  { sku: 'SKU-4892', product: 'Industrial Bearing XL', location: 'Warehouse A', priority: 'high', issue: 'Out of Stock' },
  { sku: 'SKU-2341', product: 'Steel Bolt M12', location: 'Warehouse B', priority: 'medium', issue: 'Low Stock (12 units)' },
  { sku: 'SKU-7823', product: 'Hydraulic Pump', location: 'Warehouse C', priority: 'high', issue: 'Receipt Overdue (3 days)' },
];

export const mockWarehouses: WarehouseData[] = [
  { name: 'Warehouse A', stock: '15,234', lowStock: 8, operations: 23, status: 'normal' },
  { name: 'Warehouse B', stock: '18,922', lowStock: 12, operations: 34, status: 'high' },
  { name: 'Warehouse C', stock: '11,736', lowStock: 3, operations: 15, status: 'normal' },
];

export const mockFastMoving: FastMovingItem[] = [
  { name: 'Steel Pipes 2"', sku: 'SKU-1823', moved: 234, trend: '+23%' },
  { name: 'Copper Wire Roll', sku: 'SKU-9273', moved: 189, trend: '+18%' },
  { name: 'Bearing Set', sku: 'SKU-4561', moved: 156, trend: '+15%' },
  { name: 'Valve Assembly', sku: 'SKU-7234', moved: 142, trend: '+12%' },
  { name: 'Gasket Pack', sku: 'SKU-3498', moved: 128, trend: '+9%' },
];

export const mockWarehouseLocations: WarehouseLocation[] = [
  { name: 'Mumbai Warehouse', city: 'Mumbai', coordinates: [72.8777, 19.0760], operations: 540, status: 'normal', inbound: 320, outbound: 220 },
  { name: 'Delhi Distribution Center', city: 'Delhi', coordinates: [77.1025, 28.7041], operations: 390, status: 'normal', inbound: 210, outbound: 180 },
  { name: 'Chennai Packaging Unit', city: 'Chennai', coordinates: [80.2707, 13.0827], operations: 280, status: 'warning', inbound: 150, outbound: 130 },
  { name: 'Pune Sub-Store', city: 'Pune', coordinates: [73.8567, 18.5204], operations: 140, status: 'normal', inbound: 80, outbound: 60 },
  { name: 'Bangalore Hub', city: 'Bangalore', coordinates: [77.5946, 12.9716], operations: 90, status: 'critical', inbound: 40, outbound: 50 },
];

