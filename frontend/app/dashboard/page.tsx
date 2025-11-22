'use client';

import { useState } from 'react';
import { Search, Bell, HelpCircle, Settings, User, Package, TrendingDown, Clock, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, TrendingUp, Truck, Warehouse, FileText, Activity, BarChart3, Box, RefreshCw, type LucideIcon } from 'lucide-react';

// Type Definitions
interface KPIData {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  period: string;
}

interface RecentActivity {
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment' | 'alert';
  action: string;
  user: string;
  time: string;
  icon: LucideIcon;
  color: string;
}

interface Alert {
  sku: string;
  product: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  issue: string;
}

interface WarehouseData {
  name: string;
  stock: string;
  lowStock: number;
  operations: number;
  status: 'normal' | 'high' | 'low';
}

interface FastMovingItem {
  name: string;
  sku: string;
  moved: number;
  trend: string;
}

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState<string>('dashboard');

  // Sample data with proper typing
  const kpiData: KPIData[] = [
    { label: 'Total Stock Count', value: '45,892', change: '+12%', trend: 'up', period: 'vs last month' },
    { label: 'Low Stock Items', value: '23', change: '-5%', trend: 'down', period: 'vs last week' },
    { label: 'Pending Receipts', value: '18', change: '+3', trend: 'up', period: 'Today' },
    { label: 'Pending Deliveries', value: '34', change: '+8', trend: 'up', period: 'Today' },
    { label: 'Internal Transfers', value: '12', change: '0', trend: 'neutral', period: 'In Progress' },
    { label: 'Adjustments Pending', value: '7', change: '-2', trend: 'down', period: 'Awaiting Approval' },
  ];

  const recentActivity: RecentActivity[] = [
    { type: 'receipt', action: 'Receipt #R-2845 validated', user: 'John Smith', time: '2 min ago', icon: Package, color: 'bg-green-100 text-green-600' },
    { type: 'delivery', action: 'Delivery #D-1923 completed', user: 'Sarah Lee', time: '8 min ago', icon: Truck, color: 'bg-blue-100 text-blue-600' },
    { type: 'transfer', action: 'Transfer #T-5612 scheduled', user: 'Mike Johnson', time: '15 min ago', icon: RefreshCw, color: 'bg-purple-100 text-purple-600' },
    { type: 'adjustment', action: 'Stock adjustment performed', user: 'Admin', time: '23 min ago', icon: FileText, color: 'bg-orange-100 text-orange-600' },
    { type: 'alert', action: 'Low stock alert triggered', user: 'System', time: '35 min ago', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
  ];

  const alerts: Alert[] = [
    { sku: 'SKU-4892', product: 'Industrial Bearing XL', location: 'Warehouse A', priority: 'high', issue: 'Out of Stock' },
    { sku: 'SKU-2341', product: 'Steel Bolt M12', location: 'Warehouse B', priority: 'medium', issue: 'Low Stock (12 units)' },
    { sku: 'SKU-7823', product: 'Hydraulic Pump', location: 'Warehouse C', priority: 'high', issue: 'Receipt Overdue (3 days)' },
  ];

  const warehouses: WarehouseData[] = [
    { name: 'Warehouse A', stock: '15,234', lowStock: 8, operations: 23, status: 'normal' },
    { name: 'Warehouse B', stock: '18,922', lowStock: 12, operations: 34, status: 'high' },
    { name: 'Warehouse C', stock: '11,736', lowStock: 3, operations: 15, status: 'normal' },
  ];

  const fastMoving: FastMovingItem[] = [
    { name: 'Steel Pipes 2"', sku: 'SKU-1823', moved: 234, trend: '+23%' },
    { name: 'Copper Wire Roll', sku: 'SKU-9273', moved: 189, trend: '+18%' },
    { name: 'Bearing Set', sku: 'SKU-4561', moved: 156, trend: '+15%' },
    { name: 'Valve Assembly', sku: 'SKU-7234', moved: 142, trend: '+12%' },
    { name: 'Gasket Pack', sku: 'SKU-3498', moved: 128, trend: '+9%' },
  ];

  const navItems: NavItem[] = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'receipt', icon: Package, label: 'Receipt Operations' },
    { id: 'delivery', icon: Truck, label: 'Delivery Operations' },
    { id: 'stock', icon: Box, label: 'Stock' },
    { id: 'warehouse', icon: Warehouse, label: 'Warehouse' },
    { id: 'operations', icon: Activity, label: 'Dashboard Operations' },
    { id: 'history', icon: Clock, label: 'Move History' },
    { id: 'support', icon: HelpCircle, label: 'Support' },
  ];

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
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for SKUs, products, documents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-6">
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

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Warehouse & Inventory Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600">Real-time operational overview across all warehouses</p>
              <span className="text-sm text-gray-500">• Last updated: 15 sec ago</span>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {kpiData.map((kpi: KPIData, index: number) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-sm text-gray-600 mb-2">{kpi.label}</div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {kpi.trend === 'up' && <ArrowUp className="w-4 h-4" />}
                    {kpi.trend === 'down' && <ArrowDown className="w-4 h-4" />}
                    {kpi.change}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{kpi.period}</div>
              </div>
            ))}
          </div>

          {/* Operations Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Receipt Operations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Receipts</h3>
                </div>
              </div>
              
              <div className="mb-6">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg py-4 px-6 font-semibold text-lg transition-all shadow-md hover:shadow-lg">
                  18 to Receive
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-red-600">5</div>
                  <div className="text-sm text-gray-600">Late Receipts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">18</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">234</div>
                  <div className="text-sm text-gray-600">Total Operations</div>
                </div>
              </div>
            </div>

            {/* Delivery Operations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Deliveries</h3>
                </div>
              </div>
              
              <div className="mb-6">
                <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg py-4 px-6 font-semibold text-lg transition-all shadow-md hover:shadow-lg">
                  34 to Deliver
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-red-600">8</div>
                  <div className="text-sm text-gray-600">Late</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-gray-600">Waiting</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">189</div>
                  <div className="text-sm text-gray-600">Total Operations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Widgets Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Warehouse Capacity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Warehouse Capacity</h3>
              </div>
              <div className="space-y-4">
                {warehouses.map((warehouse: WarehouseData, index: number) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{warehouse.name}</span>
                      <span className="text-sm text-gray-600">{warehouse.stock} units</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          warehouse.status === 'high' ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{warehouse.operations} operations</span>
                      <span className="text-xs text-red-600">{warehouse.lowStock} low stock</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fast-Moving SKUs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Fast-Moving SKUs</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-3">
                {fastMoving.map((item: FastMovingItem, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{item.moved}</div>
                      <div className="text-xs text-green-600">{item.trend}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts & Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Alerts and Activity</h3>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivity.map((activity: RecentActivity, index: number) => {
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
          </div>

          {/* Alerts & Exceptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alerts & Exceptions</h3>
              <span className="text-sm text-gray-600">{alerts.length} items need attention</span>
            </div>
            <div className="space-y-3">
              {alerts.map((alert: Alert, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{alert.product}</div>
                      <div className="text-sm text-gray-600">{alert.sku} • {alert.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium ${
                      alert.priority === 'high' ? 'text-red-600' : 'text-orange-600'
                    }`}>{alert.issue}</span>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors">
                <Package className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-700">Create Receipt</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
                <Truck className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-700">Delivery Order</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors">
                <RefreshCw className="w-6 h-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-700">Internal Transfer</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors">
                <FileText className="w-6 h-6 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-orange-700">Stock Adjustment</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}