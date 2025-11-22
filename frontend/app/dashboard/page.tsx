'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICard from './components/KPICard';
import OperationsCard from './components/OperationsCard';
import WarehouseMap from './maps/WarehouseMap';
import WarehouseCapacity from './components/WarehouseCapacity';
import FastMovingSKUs from './components/FastMovingSKUs';
import RecentActivity from './components/RecentActivity';
import AlertsList from './components/AlertsList';
import StockHealth from './components/StockHealth';
import QuickActions from './components/QuickActions';
import {
  mockKPIData,
  mockRecentActivity,
  mockAlerts,
  mockWarehouses,
  mockFastMoving,
  mockWarehouseLocations,
} from './data/mockData';

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState<string>('dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Warehouse & Inventory Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600">Real-time operational overview across all warehouses</p>
              <span className="text-sm text-gray-500">• Last updated: 15 sec ago</span>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {mockKPIData.map((kpi, index) => (
              <KPICard key={index} kpi={kpi} />
            ))}
          </div>

          {/* Operations Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <OperationsCard
              type="receipt"
              title="Receipts"
              count={18}
              late={5}
              pending={18}
              total={234}
            />
            <OperationsCard
              type="delivery"
              title="Deliveries"
              count={34}
              late={8}
              pending={12}
              waiting={12}
              total={189}
            />
          </div>

          {/* Widgets Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <WarehouseMap locations={mockWarehouseLocations} />
            <RecentActivity activities={mockRecentActivity} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <WarehouseCapacity warehouses={mockWarehouses} />
            <FastMovingSKUs items={mockFastMoving} />
            <StockHealth />
          </div>

          <AlertsList alerts={mockAlerts} />

          <QuickActions />
        </main>
      </div>
    </div>
  );
}
