'use client';

import { Package, BarChart3, Truck, Box, Warehouse, Activity, Clock, HelpCircle, type LucideIcon } from 'lucide-react';
import type { NavItem } from '../types';

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

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

export default function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  return (
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
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeNav === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

